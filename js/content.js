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
// リクエスト受付 (メニュー応答)
// -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- //
var g_orgBody = '';
$(function () {
	if (!chrome.extension) return;
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

var g_test = 0;
var g_timing = 0;
var g_way = 0;
var g_colorStyle = '';
var g_regStr = "(" + g_nengo_reg + ")[ \\t\\r\\n]*([0-9０-９一二三四五六七八九十百千元]+)(年?)";
var g_regAll = new RegExp(g_regStr, 'g');
var g_regOnce = new RegExp(g_regStr);
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

	// テスト用
	if (g_test) {
		g_timing = 1;
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
var g_pool = '';
var g_poolElement = null;
function ReplaceElement(element) {
	var childs = element.childNodes;
	for (var i = 0; i < element.childNodes.length; i++) {
		var t = element.childNodes[i];
		if (t.nodeName == "#comment") continue;
		if (t.nodeName == "#text") {
			//console.log(t.data);
			// テキスト置換
			var old_t = t.data;
			var new_t = ReplaceNengo(old_t);
			g_pool = '';
			// 置換に成功していたら、タグ入れ替えを行う
			if (new_t != old_t) {
				var e = document.createElement("span");
				e.innerHTML = new_t;
				if (0) {
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
				// 次の置換用に後ろ4文字を残しておく
				g_pool = new_t.substr(-4);
				g_poolElement = e;
			}
			else {
				// 次の置換用に後ろ4文字を残しておく
				g_pool = old_t.substr(-4);
				g_poolElement = t;
			}
			console.log("pool = " + g_pool);
		}
		else {
			ReplaceElement(t);
		}
	}
}

// 文字列置換 (strに含まれるもの全部)
var g_hitCount = 0;
var g_lastPos = 0;
var g_lastAfter = '';
function ReplaceNengo(str) {
	g_hitCount = 0;
	var normalStartPos = 0;
	// 先頭置換 (プール考慮)
	if (g_pool.length) {
		var tmp = g_pool + str;
		var tmp2 = tmp.replace(g_regOnce, RepCallback);
		if (g_hitCount > 0) {
			// プール影響の評価
			if (g_lastPos < g_pool.length) {
				// 今回いらないところを削る
				tmp2 = tmp2.substr(g_lastPos);
				// 前回のいらないところを削る
				if (g_poolElement) {
					console.log("culPrev: " + g_poolElement.innerHTML + " (" + g_poolElement.nodeName + ")");
					var s;
					if (g_poolElement.innerHTML != null) {
						s = g_poolElement.innerHTML;
					}
					else if (g_poolElement.data != null) {
						s = g_poolElement.data;
					}
					var n = 4;if (s.length < n) n = s.length;
					s = s.substr(0, s.length - (n - g_lastPos));
					if (g_poolElement.innerHTML != null) {
						g_poolElement.innerHTML = s;
					}
					else if (g_poolElement.data != null) {
						g_poolElement.data = s;
					}
				}
			}
			else {
				// プールは必要なかったので今回のプールを削る
				tmp2 = tmp2.substr(g_pool.length);
			}
			// 通常置換の開始位置
			normalStartPos = g_lastPos + g_lastAfter.length;
			// 結果
			str = tmp2;
		}
		else {
			// そもそもヒットしてないのでそのまま返す
			return str;
		}
	}
	// 通常置換 (プール非考慮)
	var ret = str.substr(0, normalStartPos) + str.substr(normalStartPos).replace(g_regAll, RepCallback);
	return ret;
}

/*
	文字列置換コールバック
	"昭和三2年" のような文字列を受け取り置換する
*/
function RepCallback(match_text, nengo, num, nen, pos, self) {
	g_hitCount++;
	g_lastPos = pos;
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
	g_lastAfter = ret;
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

