// 数値変換
window.onload = init;

function init() {
	chrome.extension.onRequest.addListener(
		function (request, sender, sendResponse) {
			sendResponse(localStorage[request.action]);
		}
	);
}
