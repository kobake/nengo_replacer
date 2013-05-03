// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// 同期用クラス
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
/*
	Ex)
	starter = new Starter(2, func); // preStart が 2回呼ばれたら func を実行する
	starter.preStart();
	starter.preStart(); // ここから func が呼ばれる
*/
var Starter = function (count, func) {
	this.count = count;
	this.func = func;
	this.preStart = function () {
		if (--this.count == 0) {
			this.func();
		}
	};
};

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// Node拡張
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
Node.prototype.insertAfter = function (node, referenceNode) {
	this.insertBefore(node, referenceNode.nextSibling);
};

// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// リクエスト受付
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
var g_orgBody = '';
$(function () {
	chrome.extension.onRequest.addListener(function (request, sender, callback) {
		// 手動置換
		if (request.action == 'replace') {
			g_timing = 1;
			g_way = request.way;
			if (g_way == -1) {
				// 元に戻す
				if (g_orgBody != '') {
					document.body.innerHTML = g_orgBody;
				}
			}
			else {
				RunReplaceElement();
			}
			// 一応応答を返す
			callback("");
		}
	});
});


// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
// 置換用関数
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
function RunReplaceElement() {
	// 置換
	if (g_orgBody == '') {
		// 一旦保存してから
		g_orgBody = document.body.innerHTML;
	}
	else {
		// 一旦元に戻してから
		document.body.innerHTML = g_orgBody;
	}
	ReplaceElement(document.body);
}


var g_timing = 0;
var g_way = 0;
var g_colorStyle = '';
var g_reg = new RegExp("(" + g_nengo_reg + ")[ \\t\\r\\n]*([0-9０-９一二三四五六七八九十百千元]+)(年?)", 'g');
// content起動時に呼ばれる関数
// localStorageの値を読み取り、設定に応じてページ置換処理を行う
$(function () {
	NegoReplacer();
});
function NegoReplacer() {
	// 置換実行
	var starter = new Starter(3, function () {
		//		document.body.innerHTML = ReplaceNengo(document.body.innerHTML);
		if (g_timing == 1) {
			RunReplaceElement();
		}
	});

	// ###テスト用
	if (0) {
		g_way = 2;
		g_colorStyle = "color:red; background-color:#aff";
		for (var i = 0; i < 3; i++) {
			starter.preStart();
		}
		return;
	}

	// localStorage取得
	chrome.extension.sendRequest({ "action": "timing" }, function (response) {
		g_timing = parseInt(response);
		starter.preStart();
	});
	chrome.extension.sendRequest({ "action": "way" }, function (response) {
		g_way = parseInt(response);
		starter.preStart();
	});
	chrome.extension.sendRequest({ "action": "colorStyle" }, function (response) {
		g_colorStyle = response;
		starter.preStart();
	});
}

// Element置換
// 再帰的に子供を漁る
function ReplaceElement(element) {
	var childs = element.childNodes;
	for (var i = 0; i < element.childNodes.length; i++) {
		var t = element.childNodes[i];
		if (t.nodeName == "#comment") continue;
		if (t.nodeName == "#text") {
			var new_t = ReplaceNengo(t.data);
			if (new_t != t.data) {
				var e = document.createElement("span");
				e.innerHTML = new_t;
				if (1) {
					for (var k = e.childNodes.length - 1; k >= 0; k--) {
						element.insertAfter(e.childNodes[k], t);
						i++;
					}
					element.removeChild(t);
					i--;
				}
				else {
					element.replaceChild(e, t);
				}
			}
		}
		else {
			ReplaceElement(t);
		}
	}
}

// 文字列置換
function ReplaceNengo(str) {
	return str.replace(g_reg, RepCallback);
}

/*
	文字列置換コールバック
	"昭和三2年" のような文字列を受け取り置換する
*/
function RepCallback(match_text, nengo, num, nen, pos, self) {
	// 数値変換
	num = parseInt(num.replace(/./g, ReplaceNumCallback));
	// 年号解釈
	var start = 1;
	start = g_nengo[nengo];
	// 西暦算出
	var seireki = num + start - 1;
	seireki = "西暦" + seireki + "年";
	// 色変え開始
	var ret = '';
	if (g_colorStyle != '') {
		ret += '<span style="' + g_colorStyle.replace(/"/, "'") + '">';
	}
	// 置換
	if (g_way == 0) { // ポップアップのみ
		ret += '<span title="' + seireki + '">' + match_text + "</span>";
	}
	else if (g_way == 1) { // 括弧
		ret += match_text + '(' + seireki + ')';
	}
	else if (g_way == 2) { // 完全置換
		ret += seireki;
	}
	else {
		ret += match_text;
	}
	// 色変え終了
	if (g_colorStyle != '') {
		ret += '</span>';
	}
	return ret;
}

/*
	文字列置換コールバック
	"三2" のような文字列を受け取り置換する
*/
function ReplaceNumCallback(c) {
	if (c == '元') return 1;
	var table = "0123456789０１２３４５６７８９〇一二三四五六七八九十百千";
	var n = table.indexOf(c);
	if (n < 0) {
		return c;
	}
	else if (n < 10) {
		return n;
	}
	else if (n < 20) {
		return n - 10;
	}
	else if (n < 30) {
		return n - 20;
	}
	else {
		return "";
	}
}

