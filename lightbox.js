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
//TODO: abstract flickr stuff into its own function
//TODO: promises?

//TODO: photoset object - OO
//TODO: no scrolling
//TODO: crop thumbnails
//TODO: make sure full size image isn't wider than screen

(function (){

  function FlickrPhoto(serverId, farmId, id, secret){
    this.serverId = serverId;
    this.farmId = farmId;
    this.photoId = id;
    this.secret = secret;
  }

  FlickrPhoto.prototype = {
    constructor: FlickrPhoto,
    getUrl: function(){
      return `https://farm${this.farmId}.staticflickr.com/${this.serverId}/${this.photoId}_${this.secret}_b.jpg`
    }
  }

  function PhotoSet(url, id, page, photosPerPage, numberOfPages, total, title){
    this.url = url;
    this.photosetId = id;
    this.page = page;
    this.photosPerPage = photosPerPage;
    this.numberOfPages = numberOfPages;
    this.total = total;
    this.photosetTitle = title;

    this.photos = [];
  }

  PhotoSet.prototype = {
    constructor: PhotoSet,
    getCurrentPhoto: function(){
      return this.currentPhoto;
    },
    getNextPhoto: function(){

    },
    addPhoto: function(photo){
      this.photos.push(photo);
    }
  }

  function getImagesFromServer(api_key, photoset_id, user_id, per_page, page){
    function loadXMLDoc() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == XMLHttpRequest.DONE ) {
               if (xhttp.status == 200) {
                 createPhotos(xhttp.responseText);
               }
               else if (xhttp.status == 400) {
                  console.log('There was an error 400');
               }
               else {
                   console.log('something else other than 200 was returned');
               }
            }
        };

        xhttp.open("GET", `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&user_id=${user_id}&per_page=${per_page}&page=${page}`, true);
        xhttp.send();
    }
    loadXMLDoc();
  }

  function createPhotos(xmlPhotos){
    var photosObj = parseXML(xmlPhotos);
    var photoset = photosObj.getElementsByTagName("photoset")[0];
    var photos = photosObj.getElementsByTagName("photo");
    console.log(photoset);

    var lightboxPhotos = new PhotoSet('url', photoset.getAttribute('id'), photoset.getAttribute('page'), photoset.getAttribute('perpage'), photoset.getAttribute('pages'), photoset.getAttribute('total'), photoset.getAttribute('title'));

    for (i = 0; i < photos.length; i++) {
        console.log(photos[i].getAttribute('server'));
        var photo = new FlickrPhoto(photos[i].getAttribute('server'), photos[i].getAttribute('farm'), photos[i].getAttribute('id'), photos[i].getAttribute('secret'));

        lightboxPhotos.addPhoto(photo);

        createThumbnail(photo);
    }

    console.log(lightboxPhotos);
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
      return xmlObject;
  }

  function createThumbnail(photo){
    var imageUrl = photo.getUrl();
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

    //TODO: make all variable name consistent
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

    //TODO: make IE compatible
    //TODO: function for page size
    var windowWidth = document.body.clientWidth;
    var windowHeight = document.body.clientHeight;
    console.log("HEIGHT " + windowHeight);

    var lightboxImg = document.getElementById('lightbox');
    lightboxImg.style.display = 'block';
    lightboxImg.setAttribute('src', image.getElementsByTagName("img")[0].getAttribute('src'));
    lightboxImg.style.left = (windowWidth / 2) - (lightboxImg.clientWidth /2);
    lightboxImg.style.top = (windowHeight / 2) - (lightboxImg.clientHeight /2);


    var overlay = document.getElementById("overlay");
    overlay.style.display = 'block';
    overlay.style.height = windowHeight;
    //listen for keypress

    //TODO: resize image - max width and height: 100% of screen - 50px (or something like that)

    //TODO: load all images in photoset and enable scrolling through them.



  }

  function navigateRight(){

  }

  function navigateLeft(){

  }

  function hideLightbox(){
    var lightboxImg = document.getElementById('lightbox');
    var overlay = document.getElementById("overlay");

    lightboxImg.style.display = 'none';
    overlay.style.display = 'none';

    //stop listening for key press
  }

function cropImg(){

}


  function getKey(e){
    if (e.keyCode === 39 || e.keyCode === 37) {
        if (e.keyCode === 39) {
          console.log('right');
          //return this.navigate_right();
        } else if (e.keyCode === 37) {
          //return this.navigate_left();
          console.log('left');
        }
      }
  }

var api_key = '6e7f8f609846236e84cc48c061c4d4a4';
var photoset_id = '72157672393641335';
var user_id = '142612890@N04';
var per_page = '12';
var page = '1';

window.onload = function () {
  initLightbox();
}

document.onkeydown = function (e) {
  e = e || window.event;
  console.log('key press');
  // use e.keyCode
  getKey(e);
};

})();
