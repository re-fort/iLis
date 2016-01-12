// Chrome,Safari,FireFox以外はごめんなさい
$(function(){
	if ((window.navigator.userAgent.toLowerCase().indexOf('chrome')  == -1) &&
	   (window.navigator.userAgent.toLowerCase().indexOf('safari') == -1) &&
	   (window.navigator.userAgent.toLowerCase().indexOf('firefox') == -1)){
		alert("このページはGoogle Chrome, Safari, FireFoxのみ対応しています:(");
	}
});

//背景ぼかし
var vague = $('#blurBackground').Vague({
    intensity:      70,      // Blur Intensity
    forceSVGUrl:    false,   // Force absolute path to the SVG filter,
    // default animation options
    animationOptions: {
      duration: 1000,
      easing: 'linear' // here you can use also custom jQuery easing functions
    }
});

vague.blur();

$("input").iCheck({
	checkboxClass: "icheckbox_square",
	radioClass: "iradio_square"
});

$(".selectpicker").selectpicker();

// URLからクエリパラメーター取得
var url   = location.search;
var playlistNo;
var queryKeyWord;
var queryAttribute;
var queryCountry;

if (url.match(/[\?]/g)) {
	query    = url.split("?");
	querys   = query[1].split("&");

	if (querys[0].slice(0,1) == "p") {
		playlistNo = querys[0].split("=");

		if ($.isNumeric(playlistNo[1])) {
			if (!$("#J_menuOthersPlaying").hasClass("current")) {
				$("#J_menuPlaying").removeClass("current");
				$("#J_menuMyfav").removeClass("current");
				$("#J_menuRanking").removeClass("current");
				$("#J_menuOthersPlaying").addClass("current");

				// opacity
				$("#J_playerMode").css("opacity", "0.4");
			}

			fileInfo = getFileInfo(playlistNo[1]);
			fileNm = fileInfo[0];
			albumFlg = fileInfo[1];

			if (albumFlg) {
				getOthersAlbum(fileNm);
			}
			else {
				getOthersData(fileNm);
			}
		}
	}
	if (querys[0].slice(0,1) == "s" && querys.length == 3) {
		queryKeyWord = querys[0].split("=");
		$("#J_searchInput").val(decodeURI(queryKeyWord[1]));

		queryAttribute = querys[1].split("=");
		if (queryAttribute[1] == "1") {
			$('#attribute-artist').iCheck('check');
		}
		if (queryAttribute[1] == "2") {
			$('#attribute-album').iCheck('check');
		}
		if (queryAttribute[1] == "3") {
			$('#attribute-track').iCheck('check');
		}

		queryCountry = querys[2].split("=");
		if (queryCountry[1] == "US") {
			$('.selectpicker').selectpicker('val', queryCountry[1]);
		}

		getInfo(decodeURI(queryKeyWord[1]));
	}
}

$("#J_menuPlaying").click(function() {
	if (!$("#J_menuPlaying").hasClass("current")) {
		$("#J_menuPlaying").addClass("current");
		$("#J_menuMyfav").removeClass("current");
		$("#J_menuRanking").removeClass("current");
		$("#J_menuOthersPlaying").removeClass("current");

		// リストを初期化
		$('#J_playTracksList').empty();
		$(".ui-row-item-column.c1").css("width", "33%");
		$("#J_trackCount").text("曲");
		$(".ui-row-item-column.c2").css("width", "33%");
		$(".ui-row-item-column.c2").text("アーティスト名")
		$(".ui-row-item-column.c3").text("アルバム名")
		$(".back").html("");

		if (searchWord) {
			getInfo(searchWord);
		}
		else {
			var html = '<div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column c1"></div><div class="ui-row-item-column c2"></div><div class="ui-row-item-column c3"></div></div></div>'
			// htmlにアペンド
			$("#J_playTracksList").append(html);
		}
		// opacity
		$("#J_playerMode").css("opacity", "1");
	}
});

$("#J_menuMyfav").click(function() {
	if (!$("#J_menuMyfav").hasClass("current")) {
		$("#J_menuPlaying").removeClass("current");
		$("#J_menuMyfav").addClass("current");
		$("#J_menuOthersPlaying").removeClass("current");
		$("#J_menuRanking").removeClass("current");

		$(".ui-row-item-column.c1").css("width", "33%");
		$(".ui-row-item-column.c2").css("width", "33%");
		$(".ui-row-item-column.c2").text("アーティスト名")
		$(".ui-row-item-column.c3").text("アルバム名")
		$(".back").html("");
  		$(".sharedUrl").html("");

		// opacity
		$("#J_playerMode").css("opacity", "1");
	}
	favLoad();
});

$("#J_menuRanking").click(function() {
	if (!$("#J_menuRanking").hasClass("current")) {
		$("#J_menuPlaying").removeClass("current");
		$("#J_menuMyfav").removeClass("current");
		$("#J_menuOthersPlaying").removeClass("current");
		$("#J_menuRanking").addClass("current");

		// リストを初期化
		$('#J_playTracksList').empty();
		$(".ui-row-item-column.c1").css("width", "33%");
		$("#J_trackCount").text("曲");
		$(".ui-row-item-column.c2").css("width", "33%");
		$(".ui-row-item-column.c2").text("アーティスト名")
		$(".ui-row-item-column.c3").text("アルバム名")
		$(".back").html("");
  		$(".sharedUrl").html("");

		// opacity
		$("#J_playerMode").css("opacity", "0.4");
	}
	getRanking();
});

$("#J_menuOthersPlaying").click(function() {
	if (!$("#J_menuOthersPlaying").hasClass("current")) {
		$("#J_menuPlaying").removeClass("current");
		$("#J_menuMyfav").removeClass("current");
		$("#J_menuRanking").removeClass("current");
		$("#J_menuOthersPlaying").addClass("current");

		// opacity
		$("#J_playerMode").css("opacity", "0.4");
	}
	// リストを初期化
	$('#J_playTracksList').empty();
	$(".ui-row-item-column.c1").css("width", "50%");
	$("#J_trackCount").text("プレイリスト名")
	$(".ui-row-item-column.c2").css("width", "50%");
	$(".ui-row-item-column.c2").text("プレイリスト作者");
	$(".ui-row-item-column.c3").text("");
	$(".back").html("");
  	$(".sharedUrl").html("");

	showOthersData();
});

$(".search-help").click(function() {
	introJs().start();
});

$(document).keyup(function(e) {
	var current = document.activeElement;
	if (current.id != "J_searchInput" && iTunesAudio.src != ""){
		if (e.keyCode == 39) {
			nextSong();
		}
		if (e.keyCode == 37) {
			prevSong();
		}
		if (e.keyCode == 13) {
			if ($("#J_playBtn").hasClass("pause-btn")) {
				iTunesAudio.pause();
				$("#J_playBtn").removeClass("pause-btn");
				$("#J_playBtn").addClass("play-btn");
				$(".play-btn").text("play");
				$("#m" + curNo +" span").first().removeClass("nowplaying");
				$("#m" + curNo +" span").first().addClass("notplaying");
			}
			// 一時停止した曲を再生
			else {
				if (iTunesAudio.src != ""){
					iTunesAudio.play();
					$("#J_playBtn").removeClass("play-btn");
					$("#J_playBtn").addClass("pause-btn");
					$(".pause-btn").text("pause");
					$("#m" + curNo +" span").first().removeClass("notplaying");
					$("#m" + curNo +" span").first().addClass("nowplaying");
				}
			}
		}
	}
});