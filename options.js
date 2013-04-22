// 保存ボタンを有効にする
function enableSaveButton() {
	document.getElementById("save").disabled = false;
}
// カスタム
function updateCustomStyle() {
	var label = document.getElementById('colorlabel6');
	label.style.cssText = document.getElementById('style').value;
}
function updateCustomText(i) {
	var label = document.getElementById('colorlabel' + i);
	var style = '';
	if (label.style.color) {
		style += "color: " + label.style.color.replace(/ /g, '') + "; ";
	}
	if (label.style.backgroundColor) {
		style += "background-color: " + label.style.backgroundColor.replace(/ /, '') + "; ";
	}
	$("#style").val(style);
	updateCustomStyle();
}
function selectCustom() {
	var colors = document.getElementsByName('colors');
	for (var i = 0; i < colors.length; i++) {
		colors[i].checked = false;
	}
	colors[6].checked = true;
}
$(function () {
	var colors = document.getElementsByName("colors");
	for (var i = 0; i < colors.length; i++) {
		if (i == colors.length - 1) {
			document.getElementById("style").onkeyup = function () {
				updateCustomStyle();
			};
			document.getElementById("style").onchange = function () {
				updateCustomStyle();
				selectCustom();
				enableSaveButton();
			};
			document.getElementById("style").onkeydown = function () {
				selectCustom();
				enableSaveButton();
			}
			colors[i].onclick = function () {
				enableSaveButton();
			};
		}
		else {
			colors[i].onclick = function () {
				updateCustomText(this.id.substr(this.id.length - 1, 1));
				enableSaveButton();
			};
		}
	}

	var timings = document.getElementsByName("timings");
	for (var i = 0; i < timings.length; i++) {
		timings[i].onclick = function () {
			enableSaveButton();
		}
	}

	var ways = document.getElementsByName("ways");
	for (var i = 0; i < ways.length; i++) {
		ways[i].onclick = function () {
			enableSaveButton();
		}
	}
});

// Util
function parseInt2(s) {
	if (!s) return 0;
	return parseInt(s);
}

// ロード
function restoreSetting() {
	var timings = document.getElementsByName('timings');
	var timing = parseInt2(localStorage['timing']);
	if (timing < 0 || timing >= 2) timing = 0;
	timings[timing].checked = true;

	var ways = document.getElementsByName('ways');
	var way = parseInt2(localStorage['way']);
	if (way < 0 || way >= 3) way = 0;
	ways[way].checked = true;

	var colors = document.getElementsByName('colors');
	var colorIndex = parseInt2(localStorage['colorIndex']);
	if (colorIndex < 0 || colorIndex >= colors.length) colorIndex = 0;
	colors[colorIndex].checked = true;
	if (localStorage['colorStyle'] != null) {
		document.getElementById('style').value = localStorage['colorStyle'];
	}
	updateCustomStyle();
}
$(function () {
	restoreSetting();
});

// セーブ
function saveSetting() {
	var timings = document.getElementsByName('timings');
	for (var i = 0; i < timings.length; i++) {
		if (timings[i].checked) {
			localStorage['timing'] = i;
			break;
		}
	}

	var ways = document.getElementsByName('ways');
	for (var i = 0; i < ways.length; i++) {
		if (ways[i].checked) {
			localStorage['way'] = i;
			break;
		}
	}

	var colors = document.getElementsByName('colors');
	for (var i = 0; i < colors.length; i++) {
		if (colors[i].checked) {
			localStorage['colorIndex'] = i;
			updateCustomText(i);
			break;
		}
	}
	localStorage['colorStyle'] = document.getElementById('style').value;

	document.getElementById("save").disabled = true;
}
$(function () {
	$("#save").click(function () { saveSetting(); });
});
