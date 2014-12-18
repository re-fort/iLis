// iTunes
var focusId;
var iTunesAudio = new Audio();
var searchWord;
var searchType;
var curNo;
var maxNo;
var html;

// 渡された情報をもとに検索、データ取得
function getInfo (keyWord) {

  $("#J_menuPlaying").addClass("current");
  $("#J_menuMyfav").removeClass("current");
  $("#J_menuRanking").removeClass("current");
  $("#J_menuRanking").removeClass("current");
  $("#J_menuOthersPlaying").removeClass("current");

  // リストを初期化
  $('#J_playTracksList').empty();
  $("#J_trackCount").text("曲");
  $(".ui-row-item-column.c2").text("アーティスト名")
  $(".ui-row-item-column.c3").text("アルバム名")

  $("#J_playerMode").css("opacity", "1");

  // ローディングくるくる
  $("#J_playTracksList").html("<div style='text-align:center;'><img src='/img/iLis/nowloading.gif' /></div>");

  // 基本情報
  var params = {
    lang: 'ja_jp',
    entity: 'musicTrack',
    media: 'music',
    term: keyWord,
    limit: '200',
  };
  
  searchType = $('[name=attribute]:checked').val();
  
  if (searchType == 1){
    params.attribute= 'artistTerm';
  }
  else if (searchType == 2){
    params.attribute= 'albumTerm';
  }
  else if (searchType == 3){
    params.attribute= 'songTerm';
  }
  
  params.country = $("select[name='country']").val();
  
  searchWord = keyWord;

  // APIに投げる
  $.ajax({
    url: 'https://itunes.apple.com/search',
    method: 'GET',
    data: params,
    dataType: 'jsonp',
    
    //成功
    success: function(json) {
      showData(json);
    },

    //失敗
    error: function() {
      $(function(){
        $('#J_playTracksList').empty();
        html = '<div class="ui-row-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column"><span>＊ エラーが発生しました ＊</span></div></div></div></div>';
        // htmlにアペンド
        $("#J_playTracksList").append(html);
      });
    },
  });
};

// 取得したデータを表示する
function showData(json) {
  // リストを初期化
  $('#J_playTracksList').empty();
  
  // データが取得できた
  if (json.results.length != 0) {
    curNo = -1;
    maxNo = json.results.length;
    
    // 取得曲数を反映
    $("#J_trackCount").text("曲(" + json.results.length + ")");
    
    var sArray = shuffleArrayList(json.results.length);
    for (var i = 0, len = json.results.length; i < len; i++) {
      var result = json.results[sArray[i]];
      var fav = "notfav";
      var favTxt = "heartempty";

      if (localStorage.getItem(result.trackId)) {
        fav = "fav";
        favTxt = "heart"
      }

      // HTML作成
      html = '<div id ="m' + i + '" class="ui-row-item ui-track-item" data-previewurl="' + result.previewUrl + '" data-image="' + result.artworkUrl100 
              + '" data-artistname="' + result.artistName + '" data-trackname="' + result.trackName + '" data-artistviewurl="' + result.artistViewUrl 
              + '&amp;at=10ldcR" data-trackviewurl="' + result.trackViewUrl + '&amp;at=10ldcR" data-collectionname="' + result.collectionName 
              + '" data-collectionviewurl="' + result.collectionViewUrl + '&amp;at=10ldcR" data-trackid="' + result.trackId 
              + '"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c1"><span class="lsf playmedia notplaying" onClick="playSong(' + i 
              + ');">playmedia</span><span class="song" onClick="playSong(' + i + ');">' + result.trackName + '</span></div><div class="ui-row-item c2"><a href="' + result.artistViewUrl 
              + '&amp;at=10ldcR" target="_blank">' + result.artistName + '</a></div><div class="ui-row-item c3" data-album-id="442861"><a href="' + result.collectionViewUrl 
              + '&amp;at=10ldcR" target="_blank">' + result.collectionName + '</a></div></div><div class="ui-track-control"><span class="J_trackFav lsf ' + fav 
              + '" onClick="favSong(' + i + ', true)">' + favTxt + '</span><a href="https://www.youtube.com/results?search_query=' + result.trackName + ' ' + result.artistName
              + '" class="social" target="_blank"><span class="J_trackFav lsf youtube">youtube</span></a></div>'

      // htmlにアペンド
      $("#J_playTracksList").append(html);
    }
  }
  // データが取得できなかった
  else {
    html = '<div class="ui-row-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column"><span>＊ 曲が見つかりませんでした ＊</span></div></div></div></div>';
    // htmlにアペンド
    $("#J_playTracksList").append(html);
  }
}

// 取得した曲をランダムに配列に入れる(Fisher-Yates)
function shuffleArrayList(j){
  var array = [];
  for (var k = 0; k < j; k++) {
    array[k] = k;
  }
  Array.prototype.shuffle = function() {
    var i = this.length;
    while(i){
      var j = Math.floor(Math.random()*i);
      var t = this[--i];
      this[i] = this[j];
      this[j] = t;
    }
    return this;
  }
  array.shuffle();
  return array;
}

// お気に入りを読み込み
function favLoad(){
  var fav;
  curNo = -1;

  // ローディングくるくる
  $("#J_playTracksList").html("<div style='text-align:center;'><img src='/img/iLis/nowloading.gif' /></div>");

  if (localStorage.length != 0) {
    // リストを初期化
    $('#J_playTracksList').empty();
    
    maxNo = localStorage.length;
    // 取得曲数を反映
    $("#J_trackCount").text("曲(" + localStorage.length + ")");

    var sArray = shuffleArrayList(localStorage.length);

    for (var i = 0; i < localStorage.length; i++){
      fav = JSON.parse(localStorage.getItem(localStorage.key(sArray[i])));
      html = '<div id ="m' + i + '" class="ui-row-item ui-track-item" data-previewurl="' + fav.previewUrl + '" data-image="' + fav.image + '" data-artistname="' 
              + fav.artistName + '" data-trackname="' + fav.trackName + '" data-artistviewurl="' + fav.artistViewUrl + '" data-trackviewurl="' + fav.trackViewUrl 
              + '" data-collectionname="' + fav.collectionName + '" data-collectionviewurl="' + fav.collectionViewUrl + '" data-trackid="' + localStorage.key(sArray[i]) 
              + '"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c1"><span class="lsf playmedia notplaying" onClick="playSong(' 
              + i + ');">playmedia</span><span class="song" onClick="playSong(' + i + ');">' + fav.trackName + '</span></div><div class="ui-row-item c2"><a href="' 
              + fav.artistViewUrl + '" target="_blank">' + fav.artistName + '</a></div><div class="ui-row-item c3"><a href="' + fav.collectionViewUrl 
              + '" target="_blank">' + fav.collectionName + '</a></div></div><div class="ui-track-control"><span class="J_trackFav lsf fav" onClick="favSong(' + i 
              + ', true)">heart</span><a href="https://www.youtube.com/results?search_query=' + fav.trackName + ' ' + fav.artistName
              + '" class="social" target="_blank"><span class="J_trackFav lsf youtube">youtube</span></a></div></div></div>'
      // htmlにアペンド
      $("#J_playTracksList").append(html);
    }
  }
  else {
    // リストを初期化
    $('#J_playTracksList').empty();

    $("#J_trackCount").text("");
    html = '<div class="ui-row-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column"><span>＊ お気に入りが登録されていません ＊</span></div></div></div></div>';
    // htmlにアペンド
    $("#J_playTracksList").append(html);
  }
}

// ランキング取得
function getRanking () {

  // ローディングくるくる
  $("#J_playTracksList").html("<div style='text-align:center;'><img src='/img/iLis/nowloading.gif' /></div>");

  // APIに投げる
  $.ajax({
    url: 'https://itunes.apple.com/jp/rss/topsongs/limit=100/json',
    method: 'GET',
    dataType: 'jsonp',
    
    //成功
    success: function(json) {
      showRankingData(json, false);
    },

    //失敗
    error: function() {
      $(function(){
        $('#J_playTracksList').empty();
        html = '<div class="ui-row-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column"><span>＊ エラーが発生しました ＊</span></div></div></div></div>';
        // htmlにアペンド
        $("#J_playTracksList").append(html);
      });
    },
  });
};

// 取得したデータを表示する
function showRankingData(json) {
  // リストを初期化
  $('#J_playTracksList').empty();
  
  // データが取得できた
  if (json.feed.entry.length != 0) {
    curNo = -1;
    maxNo = json.feed.entry.length;
    
    // 取得曲数を反映
    $("#J_trackCount").text("曲(" + json.feed.entry.length + ")");
    
    // キーからコロンを除去し、再格納
    var jsonStr = JSON.stringify(json);
    jsonStr = jsonStr.replace(/im:/g, "");
    json = JSON.parse(jsonStr);

    for (var i = 0, len = json.feed.entry.length; i < len; i++) {
      var fav = "notfav";
      var favTxt = "heartempty";

      if (localStorage.getItem(json.feed.entry[i].id.attributes.id)) {
        fav = "fav";
        favTxt = "heart"
      }

      // HTML作成
      html = '<div id ="m' + i + '" class="ui-row-item ui-track-item" data-previewurl="' + json.feed.entry[i].link[1].attributes.href + '" data-image="' 
            + json.feed.entry[i].image[2].label + '" data-artistname="' + json.feed.entry[i].artist.label + '" data-trackname="' + json.feed.entry[i].name.label 
            + '" data-artistviewurl="' + json.feed.entry[i].artist.attributes.href + '&amp;at=10ldcR" data-trackviewurl="' + json.feed.entry[i].link[0].attributes.href 
            + '&amp;at=10ldcR" data-collectionname="' + json.feed.entry[i].collection.name.label + '" data-collectionviewurl="' + json.feed.entry[i].link[0].attributes.href 
            + '&amp;at=10ldcR" data-trackid="' + json.feed.entry[i].id.attributes.id + '"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c1"><span class="lsf playmedia notplaying" onClick="playSong(' + i + ');">playmedia</span><span class="song" onClick="playSong(' + i + ');">' 
            + json.feed.entry[i].name.label + '</span></div><div class="ui-row-item c2"><a href="' + json.feed.entry[i].artist.attributes.href + '&amp;at=10ldcR" target="_blank">' 
            + json.feed.entry[i].artist.label + '</a></div><div class="ui-row-item c3" data-album-id="442861"><a href="' + json.feed.entry[i].link[0].attributes.href 
            + '&amp;at=10ldcR">' + json.feed.entry[i].collection.name.label + '</a></div></div><div class="ui-track-control"><span class="J_trackFav lsf ' + fav 
            + '" onClick="favSong(' + i + ', true)">' + favTxt + '</span><a href="https://www.youtube.com/results?search_query=' + json.feed.entry[i].name.label + ' ' 
            + json.feed.entry[i].artist.label + '" class="social" target="_blank"><span class="J_trackFav lsf youtube">youtube</span></a></div></div></div>'
      
      // htmlにアペンド
      $("#J_playTracksList").append(html);
    }
  }
  // データが取得できなかった
  else {
    html = '<div class="ui-row-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item-column"><span>＊ 曲が見つかりませんでした ＊</span></div></div></div></div>';
    // htmlにアペンド
    $("#J_playTracksList").append(html);
    $("#J_trackCount").text("");
  }
}

// みんなのプレイリスト・リスト表示
function showOthersData () {
  
  // ローディングくるくる
  $("#J_playTracksList").html("<div style='text-align:center;'><img src='/img/iLis/nowloading.gif' /></div>");

  $('#J_playTracksList').empty();
  html = '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'1'" + ')">2010年代ベストトラック(邦楽)</span></div><div class="ui-row-item c2"><a href="https://twitter.com/pitti2210" target="_blank"><span>ぴっち</span></a></div></div></div></div>'
          + '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'2'" + ')">2010年代ベストトラック(邦楽)</span></div><div class="ui-row-item c2"><a href="https://twitter.com/jyanomegasa" target="_blank"><span>じゃのめ</span></a></div></div></div></div>'
          + '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'3'" + ')">2010年代ベストトラック(邦楽)</span></div><div class="ui-row-item c2"><a href="https://twitter.com/re_fort" target="_blank"><span>れーふぉ</span></a></div></div></div></div>'
          + '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'4'" + ')">2010年代ベストトラック(邦楽)</span></div><div class="ui-row-item c2"><a href="https://twitter.com/MetaParadox" target="_blank"><span>MetaParadox</span></a></div></div></div></div>'
          + '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'5'" + ')">2010年代ベストトラック(邦楽) 1位〜200位</span></div><div class="ui-row-item c2"><a href=# target="_blank"><span>いろいろな方々</span></a></div></div></div></div>'
          + '<div class="ui-row-item ui-track-item"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c4"><span class="lsf">memo</span><span class="song" onClick="getOthersData(' + "'6'" + ')">2010年代ベストトラック(洋楽) 1位〜100位</span></div><div class="ui-row-item c2"><a href=# target="_blank"><span>いろいろな方々</span></a></div></div></div></div>';
  // htmlにアペンド
  $("#J_playTracksList").append(html);
}

// みんなのプレイリスト・曲取得
function getOthersData (fileNo) {
  
  var fileNm = getFileName(fileNo);

  // ローディングくるくる
  $("#J_playTracksList").html("<div style='text-align:center;'><img src='/img/iLis/nowloading.gif' /></div>");

  $(".ui-row-item-column.c1").css("width", "33%");
  $("#J_trackCount").text("曲");
  $(".ui-row-item-column.c2").css("width", "33%");
  $(".ui-row-item-column.c2").text("アーティスト名");
  $(".ui-row-item-column.c3").text("アルバム名");

  $('#J_playTracksList').empty();

  $.getJSON(fileNm, function(json){
    // 取得曲数を反映
    $("#J_trackCount").text("曲(" + json.playList.length + ")");
    maxNo = json.playList.length;
    
    for (var i = 0, len = json.playList.length; i < len; i++) {
      var result = json.playList[i];
      var fav = "notfav";
      var favTxt = "heartempty";

      if (localStorage.getItem(result.trackId)) {
        fav = "fav";
        favTxt = "heart"
      }

      // HTML作成
      html = '<div id ="m' + i + '" class="ui-row-item ui-track-item" data-previewurl="' + result.previewUrl + '" data-image="' + result.image 
              + '" data-artistname="' + result.artistName + '" data-trackname="' + result.trackName + '" data-artistviewurl="' + result.artistViewUrl 
              + '&amp;at=10ldcR" data-trackviewurl="' + result.trackViewUrl + '&amp;at=10ldcR" data-collectionname="' + result.collectionName 
              + '" data-collectionviewurl="' + result.collectionViewUrl + '&amp;at=10ldcR" data-trackid="' + result.trackId 
              + '"><div class="ui-track-main"><div class="ui-row-item-body"><div class="ui-row-item c1"><span class="lsf playmedia notplaying" onClick="playSong(' + i 
              + ');">playmedia</span><span class="song" onClick="playSong(' + i + ');">' + result.trackName + '</span></div><div class="ui-row-item c2"><a href="' + result.artistViewUrl 
              + '&amp;at=10ldcR" target="_blank">' + result.artistName + '</a></div><div class="ui-row-item c3" data-album-id="442861"><a href="' + result.collectionViewUrl 
              + '&amp;at=10ldcR" target="_blank">' + result.collectionName + '</a></div></div><div class="ui-track-control"><span class="J_trackFav lsf ' + fav 
              + '" onClick="favSong(' + i + ', true)">' + favTxt + '</span><a href="https://www.youtube.com/results?search_query=' + result.trackName + ' ' + result.artistName
              + '" class="social" target="_blank"><span class="J_trackFav lsf youtube">youtube</span></a></div>'

      // htmlにアペンド
      $("#J_playTracksList").append(html);
    }
  });
}

function getFileName (fileNo) {

  var fileNm;

  switch (fileNo){
  case "1":
    fileNm = "/iLis/pitti_2010s_J.json";
    break;
  case "2":
    fileNm = "/iLis/jyanome_2010s_J.json";
    break;
  case "3":
    fileNm = "/iLis/re-fort_2010s_J.json";
    break;
  case "4":
    fileNm = "/iLis/metaparadox_2010s_J.json";
    break;
  case "5":
    fileNm = "/iLis/result_2010s_J.json";
    break;
  case "6":
    fileNm = "/iLis/result_2010s_F.json";
    break;
  default:
    fileNm = "/iLis/result_2010s_J.json";
    break;
  }

  return fileNm;
}

// 前の曲を再生
function prevSong(){
  $(function(){
    if (iTunesAudio.src != ""){
      if (curNo != 0) {
        iTunesAudio.pause();
        playSong(curNo - 1);
      }
      else {
        playSong(maxNo - 1);
      }
    }
  });
};

// 次の曲を再生
function nextSong(){
  $(function(){
    if (iTunesAudio.src != ""){
      if (curNo != maxNo - 1) {
        iTunesAudio.pause();
        playSong(curNo + 1);
      }
      else {
        playSong(0);
      }
    }
  });
};

// 曲を停止
function stopSong() {
  $(function(){
    iTunesAudio.pause();
    $(".progress .slider-selection").css("width", 0);
    $("#J_positionTime").text("00:00");
    $("#J_playBtn").removeClass("pause-btn");
    $("#J_playBtn").addClass("play-btn");
    $(".play-btn").text("play");
    $("#m" + curNo +" span").first().removeClass("nowplaying");
    $("#m" + curNo +" span").first().addClass("notplaying");
  });
};

// 曲を再生
function playSong(songNo){
  $(function(){
    var $music = $("#m" + songNo +"");
    
    // 背景を変える
    $("#blurBackground").css("background-image", "url(" + $music.data('image') + ")");
    
    // 画像を変える
    $("img", "#J_playerCover").attr("src", $music.data('image'));
    $("a", "#J_playerCover").attr("href", $music.data('collectionviewurl'));
    
    // アーティスト名、曲名をセット
    $("#J_artistName").text($music.data('artistname'));
    $("#J_artistName").attr("href", $music.data('artistviewurl'));
    $("#J_trackName").text($music.data('trackname'));
    $("#J_trackName").attr("href", $music.data('trackviewurl'));

    // fav情報をセット
    $("#J_trackInfo").attr("data-trackid", $music.data('trackid'));
    $("#J_trackInfo").attr("data-previewurl", $music.data('previewurl'));
    $("#J_trackInfo").attr("data-image", $music.data('image'));
    $("#J_trackInfo").attr("data-collectionname", $music.data('collectionname'));
    $("#J_trackInfo").attr("data-collectionviewurl", $music.data('collectionviewurl'));
    
    if (localStorage.getItem($music.data('trackid'))) {
      $("#J_trackFav").removeClass("notfav");
      $("#J_trackFav").addClass("fav");
      $("#J_trackFav").text("heart");
    }
    else {
      $("#J_trackFav").removeClass("fav");
      $("#J_trackFav").addClass("notfav");
      $("#J_trackFav").text("heartempty");
    }

    if (curNo != null) {
      $("#m" + curNo +" span").first().removeClass("nowplaying");
      $("#m" + curNo +" span").first().addClass("notplaying");
      $("#m" + curNo +"").removeClass("ui-track-current");
    }
    
    $("#m" + songNo +" span").first().removeClass("notplaying");
    $("#m" + songNo +" span").first().addClass("nowplaying");
    $("#m" + songNo +"").addClass("ui-track-current");
    
    curNo = songNo;
    
    iTunesAudio.src = $music.data("previewurl");
    $(iTunesAudio).on("canplay", function(){ iTunesAudio.play();});

    // 総時間を表示
    $(iTunesAudio).on("loadedmetadata", function() {
      var durationTime = Math.round(iTunesAudio.duration);
      durationTimeRound = "00:" + ("0" + durationTime).slice(-2);
      $("#J_durationTime").text(durationTimeRound);
    });

    // 経過時間を表示
    $(iTunesAudio).on("timeupdate", function() {
        var currentTime = Math.floor(iTunesAudio.currentTime);
        currentTimeRound = "00:" + ("0" + currentTime).slice(-2);
        $("#J_positionTime").text(currentTimeRound);
        if (iTunesAudio.duration) {
          var percent = (currentTime / iTunesAudio.duration * 100) + '%';
          $(".progress .slider-selection").css("width", percent);
        }
    });

    $("#J_playBtn").removeClass("play-btn");
    $("#J_playBtn").addClass("pause-btn");
    $(".pause-btn").text("pause");
  });
};

$("#J_playBtn").click(function () {
  // 曲を一時停止
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
});

$("#J_playerMode").click(function () {
  if ($("#J_menuPlaying").hasClass("current")) {
    if (searchWord) {
      getInfo(searchWord);
    }
  }
  if ($("#J_menuMyfav").hasClass("current")) {
    favLoad();
  }
});

$('#progressSlider').slider({
  formater: function(value) {
    if (iTunesAudio.src != ""){
      iTunesAudio.currentTime = value;
    }
  }
});

function favSong(songNo, playlistFlg){
  var $music = $("#m" + songNo +"");
  var obj;

  if (playlistFlg) {
    if (localStorage.getItem($music.data('trackid'))) {
      // 削除
      localStorage.removeItem($music.data('trackid'));
    }
    else {
      obj = {
        trackId:$music.data('trackid'),
        previewUrl:$music.data('previewurl'),
        image:$music.data('image'),
        artistName:$music.data('artistname'),
        artistViewUrl:$music.data('artistviewurl'),
        trackName:$music.data('trackname'),
        trackviewurl:$music.data('trackviewurl'),
        collectionName:$music.data('collectionname'),
        collectionviewurl:$music.data('collectionviewurl')
      };
      // 保存
      localStorage.setItem($music.data('trackid'),JSON.stringify(obj));
    }

    if ($($music).find(".J_trackFav").hasClass("notfav")) {
      $($music).find(".notfav").addClass("fav");
      $($music).find(".notfav").removeClass("notfav");
      $($music).find(".fav").text("heart");
    }
    else {
      $($music).find(".fav").addClass("notfav");
      $($music).find(".fav").removeClass("fav");
      $($music).find(".notfav").text("heartempty");
    }

    if (curNo == songNo) {
      if ($("#J_trackFav").hasClass("notfav")) {
        $("#J_trackFav").removeClass("notfav");
        $("#J_trackFav").addClass("fav");
        $("#J_trackFav").text("heart");
      }
      else {
        $("#J_trackFav").removeClass("fav");
        $("#J_trackFav").addClass("notfav")
        $("#J_trackFav").text("heartempty");
      }
    }
  }
  else {
    if (iTunesAudio.src != ""){
      if (localStorage.getItem($("#J_trackInfo").attr('data-trackid'))) {
      // 削除
      localStorage.removeItem($("#J_trackInfo").attr('data-trackid'));
      }
      else {
        obj = {
          previewUrl:$("#J_trackInfo").attr('data-previewurl'),
          image:$("#J_trackInfo").attr('data-image'),
          artistName:$("#J_artistName").text(),
          artistViewUrl:$("#J_artistName").attr('href'),
          trackName:$("#J_trackName").text(),
          trackviewurl:$("#J_trackName").attr('href'),
          collectionName:$("#J_trackInfo").attr('data-collectionname'),
          collectionviewurl:$("#J_trackInfo").attr('data-collectionviewurl')
        };
        // 保存
        localStorage.setItem($("#J_trackInfo").attr('data-trackid'),JSON.stringify(obj));
      }
      // お気に入り登録
      if ($("#J_trackFav").hasClass("notfav")) {
        $("#J_trackFav").removeClass("notfav");
        $("#J_trackFav").addClass("fav");
        $("#J_trackFav").text("heart");
      }
      // お気に入り解除
      else {
        $("#J_trackFav").removeClass("fav");
        $("#J_trackFav").addClass("notfav");
        $("#J_trackFav").text("heartempty");
      }

      if ($("#J_trackInfo").attr('data-previewurl') == $music.attr('data-previewurl')) {
        if ($($music).find(".J_trackFav").hasClass("notfav")) {
          $($music).find(".notfav").addClass("fav");
          $($music).find(".notfav").removeClass("notfav");
          $($music).find(".fav").text("heart");
        }
        else {
          $($music).find(".fav").addClass("notfav");
          $($music).find(".fav").removeClass("fav");
          $($music).find(".notfav").text("heartempty");
        }
      }
    }
  }
}

$('#volumeSlider').slider({
  formater: function(value) {
    iTunesAudio.volume = value /100;
  }
});

$("#J_volumeSpeaker").click(function () {
  // ミュート
  if ($("#J_volumeSpeaker").hasClass("volume-on")) {
    iTunesAudio.volume = 0;
    $("#J_volumeSpeaker").removeClass("volume-on");
    $("#J_volumeSpeaker").addClass("volume-off");
    $(".volume-off").text("volumeoff");
    $(".volume-wrap").find(".slider-selection").css("width", "0%");
  }
  // ミュートを解除
  else {
    iTunesAudio.volume = 1;
    $("#J_volumeSpeaker").removeClass("volume-off");
    $("#J_volumeSpeaker").addClass("volume-on");
    $(".volume-on").text("volumeup");
    $(".volume-wrap").find(".slider-selection").css("width", "100%");
  }
});

// 曲終了時に次の曲を再生させる
$(iTunesAudio).on("ended", function(){ if(curNo != maxNo -1) {playSong(curNo + 1);}else{stopSong();};});