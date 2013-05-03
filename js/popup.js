function sendRequestToSelectedTab(way) {
	// 選択されているタブにリクエストを送信する
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.sendRequest(tab.id, { 'action': 'replace', 'way': way }, function (response) {
			window.close();
		});
	});
}

$(function () {
	document.getElementById("menu_whole").onclick = function () {
		sendRequestToSelectedTab(2);
	}
	document.getElementById("menu_kakko").onclick = function () {
		sendRequestToSelectedTab(1);
	}
	document.getElementById("menu_mouse").onclick = function () {
		sendRequestToSelectedTab(0);
	}
	document.getElementById("menu_repair").onclick = function () {
		sendRequestToSelectedTab(-1);
	}
});

