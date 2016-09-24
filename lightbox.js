//load 32 images
//have a load more button on the bottom
//adds to the gallery of thumbnails displayed on the page

//PHOTO URL
//
// https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg
//
// farm-id: 1
// server-id: 2
// photo-id: 1418878
// secret: 1e92283336
// size: m

//TODO: Error handling for requests + xml parsing
//TODO: only load 32 photos from server at a time
//TODO: overlay full height
//TODO: image loading spinner

(function (){

  function getImagesFromServer(api_key, photoset_id, user_id, per_page, page){
    function loadXMLDoc() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == XMLHttpRequest.DONE ) {
               if (xhttp.status == 200) {
                 console.log(xhttp.responseText)

                 parseXML(xhttp.responseText);

                   //document.getElementById("myDiv").innerHTML = xhttp.responseText;
               }
               else if (xhttp.status == 400) {
                  alert('There was an error 400');
               }
               else {
                   alert('something else other than 200 was returned');
               }
            }
        };

        xhttp.open("GET", `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&user_id=${user_id}&per_page=${per_page}&page=${page}`, true);
        xhttp.send();
    }
    loadXMLDoc();
  }

  function parseXML(text){
      var xmlObject;
      if (window.DOMParser){
        var parser = new DOMParser();
        xmlObject = parser.parseFromString(text,"text/xml");
      }
      else { //Internet Explorer
        xmlObject=new ActiveXObject("Microsoft.XMLDOM");
        xmlObject.async=false;
        xmlObject.loadXML(text);
      }
      console.log(xmlObject);
      createPhotoUrls(xmlObject);
  }

  function createPhotoUrls(xmlPhotoset){
    console.log(xmlPhotoset.getElementsByTagName("photo"));
    var photos = xmlPhotoset.getElementsByTagName("photo");
    for (i = 0; i < photos.length; i++) {
        console.log(photos[i].getAttribute('server'));
        //should var be declared in for loop?
        var serverId = photos[i].getAttribute('server');
        var farmId = photos[i].getAttribute('farm');
        var id = photos[i].getAttribute('id');
        var secret = photos[i].getAttribute('secret');

        createThumbnail(serverId, farmId, id, secret);
        //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
    }
  }

  function createThumbnail(serverId, farmId, id, secret){
    var imageUrl = `https://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}.jpg`;
    var photosetElement = document.getElementById("photoset");

    var link = document.createElement('a');
    link.setAttribute('href', '#');
    link.onclick = function () {
      showLightbox(this);
      return false;
    };

    var thumbnail = document.createElement('img');
    thumbnail.setAttribute('src',imageUrl);
    thumbnail.setAttribute('class', 'square');

    link.appendChild(thumbnail);
    photosetElement.appendChild(link);
  }

  function initLightbox(){
    //create all document elements first - with no display to be called in showLightbox()
    //console.log(documentBody);

    var darkBackground = document.createElement('div');
    darkBackground.setAttribute('class', 'darkOverlay');
    darkBackground.setAttribute('id', 'overlay');
    darkBackground.onclick = hideLightbox;
    document.body.appendChild(darkBackground);

    var lightboxImg = document.createElement('img');
    lightboxImg.setAttribute('id', 'lightbox');
    lightboxImg.setAttribute('class', 'lightboxImg');
    document.body.appendChild(lightboxImg);

    getImagesFromServer(api_key, photoset_id, user_id, per_page, page);

  }

  function showLightbox(image){
    console.log(image.getElementsByTagName("img")[0].getAttribute('src'));

    var lightboxImg = document.getElementById('lightbox');
    lightboxImg.style.display = 'block';
    lightboxImg.setAttribute('src', image.getElementsByTagName("img")[0].getAttribute('src'));

    var overlay = document.getElementById("overlay");
    overlay.style.display = 'block';

    //listen for keypress

  }

  function hideLightbox(){
    var lightboxImg = document.getElementById('lightbox');
    var overlay = document.getElementById("overlay");

    lightboxImg.style.display = 'none';
    overlay.style.display = 'none';

    //stop listening for key press
  }

  document.onkeypress = function (e) {
    e = e || window.event;
    // use e.keyCode
  };

  function getKey(){

  }

var api_key = '6e7f8f609846236e84cc48c061c4d4a4';
var photoset_id = '72157672393641335';
var user_id = '142612890@N04';
var per_page = '12';
var page = '1';

window.onload = function () {
  initLightbox();
}

})();
