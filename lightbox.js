//load 12 images
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
//TODO: promises?
//TODO: abstract flickr stuff into its own function
//TODO: readme
//TODO: move lightboxphotos object to init lightbox
//TODO: make css class names consistent
//TODO: not currently working in Firefox - onclick function
//TODO: test with Internet Explorer
//TODO; header section: smaller height screens + centering with gallery


(function (){

  function FlickrPhoto(serverId, farmId, id, secret, title){
    this.serverId = serverId;
    this.farmId = farmId;
    this.photoId = id;
    this.secret = secret;
    this.title = title;
  }

  FlickrPhoto.prototype = {
    constructor: FlickrPhoto,
    getUrl: function (){
      return "https://farm" + this.farmId + ".staticflickr.com/" + this.serverId + "/" + this.photoId + "_" + this.secret + "_b.jpg";
    },
    getTitle: function (){
      return this.title;
    }
  }

  function PhotoSet(id, page, photosPerPage, apiKey, userId){
    this.photosetId = id;
    this.page = page;
    this.photosPerPage = photosPerPage;
    //this.numberOfPages = numberOfPages;
    //this.total = total;
    //this.photosetTitle = title;
    this.apiKey = apiKey;
    this.userId = userId;

    this.photos = [];
  }

  PhotoSet.prototype = {
    constructor: PhotoSet,
    setCurrentPhoto: function (index){
      this.currentPhoto = index;
    },
    getCurrentPhoto: function(){
      return this.currentPhoto;
    },
    getPhoto: function(index){
      return this.photos[index];
    },
    getNumberOfPhotos: function(){
      return this.photos.length;
    },
    addPhoto: function(photo){
      this.photos.push(photo);
    },
    getPage: function(){
      return this.page;
    },
    setPage: function(page){
      this.page = page;
    },
    getUrl: function() {
      return "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" +  this.apiKey + "&photoset_id=" + this.photosetId + "&user_id=" + this.userId  + "&per_page=" + this.photosPerPage + "&page=" + this.page;
    },
    getNumberOfPages: function(){
      return this.numberOfPages;
    },
    setNumberOfPages: function(numPages){
      this.numberOfPages = numPages;
    }
  }

  var lightboxPhotos;


  function initLightbox(){

    //TODO: clean up this function

    //get Flickr values from html element
    var photosetElement = document.getElementById("photoset");
    var api_key = photosetElement.getAttribute('kick-api-key');
    var photoset_id = photosetElement.getAttribute('kick-photoset-id');
    var user_id = photosetElement.getAttribute('kick-user-id');
    var per_page = photosetElement.getAttribute('kick-per-page');
    var page = photosetElement.getAttribute('kick-page');

    //create all document elements but don't display them until lightbox is shown
    var overlay = document.createElement('div');
    overlay.setAttribute('class', 'darkOverlay');
    overlay.setAttribute('id', 'overlay');
    overlay.onclick = hideLightbox;
    document.body.appendChild(overlay);

    var lightboxImg = document.createElement('img');
    lightboxImg.setAttribute('id', 'lightbox');
    lightboxImg.setAttribute('class', 'lightboxImg');
    document.body.appendChild(lightboxImg);

    //close button
    var closeBtn = document.createElement('a');
    closeBtn.setAttribute('class', 'close-btn');
    closeBtn.setAttribute('id', 'close-btn');
    closeBtn.onclick = hideLightbox;

    var closeBtnImg = document.createElement('img');
    closeBtnImg.setAttribute('src', 'xbutton.png');

    closeBtn.appendChild(closeBtnImg);
    document.body.appendChild(closeBtn);

    //scrolling buttons
    var rightArrow = document.createElement('a');
    rightArrow.setAttribute('class', 'right-arrow');
    rightArrow.setAttribute('id','right-arrow');
    rightArrow.onclick = function () {
      navigate("right");
    };

    var rightArrowImg = document.createElement('img');
    rightArrowImg.setAttribute('src', 'right-arrow.png');

    rightArrow.appendChild(rightArrowImg);
    document.body.appendChild(rightArrow);

    var leftArrow = document.createElement('a');
    leftArrow.setAttribute('class', 'left-arrow');
    leftArrow.setAttribute('id', 'left-arrow');
    leftArrow.onclick = function () {
      navigate("left");
    };

    var leftArrowImg = document.createElement('img');
    leftArrowImg.setAttribute('src', 'left-arrow.png');

    leftArrow.appendChild(leftArrowImg);
    document.body.appendChild(leftArrow);

    var title = document.createElement('div');
    title.setAttribute('class', 'photo-title');
    title.setAttribute('id', 'photo-title');
    document.body.appendChild(title);

    //add a button to load more photos
    var buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class', 'addmore-container');

    var addMoreBtn = document.createElement('button');
    addMoreBtn.setAttribute('type', 'button');
    addMoreBtn.setAttribute('class', 'addmore-btn');
    addMoreBtn.setAttribute('id', 'addmore-photos');
    var addMoreText = document.createTextNode("Load More Images");
    addMoreBtn.appendChild(addMoreText);
    addMoreBtn.onclick = loadMoreImages;

    buttonContainer.appendChild(addMoreBtn);

    document.getElementById("main-content").appendChild(buttonContainer);

    lightboxPhotos = new PhotoSet(photoset_id, page, per_page, api_key, user_id);

    getImagesFromServer(lightboxPhotos.getUrl());
  }

  //TODO: refactor - promise
  function getImagesFromServer(url){
    function loadXMLDoc() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == XMLHttpRequest.DONE ) {
               if (xhttp.status == 200) {
                 createPhotos(xhttp.responseText);
               }
               else if (xhttp.status == 400) {
                 //TODO: throw error
                  console.log('There was an error 400');
               }
               else {
                   console.log('something else other than 200 was returned');
               }
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    }
    loadXMLDoc();
  }

  function loadMoreImages(){
    var currentPage = lightboxPhotos.getPage();
    console.log(currentPage);
    if (parseInt(currentPage) == parseInt(lightboxPhotos.getNumberOfPages())){
      //TODO: finish logic for getting to end of number of images (tell the user)
      //just remove the load more button - and add a star
      var addMoreBtn = document.getElementById('addmore-photos');
      addMoreBtn.style.display = 'none';
    }
    else {
      lightboxPhotos.setPage(parseInt(currentPage) + 1);
      getImagesFromServer(lightboxPhotos.getUrl());
    }
  }

  function createPhotos(xmlPhotos){
    //TODO: refactor?

    var photosObj = parseXML(xmlPhotos);
    var photoset = photosObj.getElementsByTagName("photoset")[0];
    var photos = photosObj.getElementsByTagName("photo");
    var index;

    if(lightboxPhotos.getNumberOfPhotos() == 0){
      lightboxPhotos.setNumberOfPages(photoset.getAttribute('pages'));
      lightboxPhotos.setNumberOfPages(photoset.getAttribute('total'));
      lightboxPhotos.setNumberOfPages(photoset.getAttribute('title'));

      index = 0;
    }
    else {
      index = lightboxPhotos.getNumberOfPhotos();
    }

    for (i = 0; i < photos.length; i++) {
        var photo = new FlickrPhoto(photos[i].getAttribute('server'), photos[i].getAttribute('farm'), photos[i].getAttribute('id'), photos[i].getAttribute('secret'),photos[i].getAttribute('title'));

        lightboxPhotos.addPhoto(photo);

        createThumbnail(photo, index);
        index ++;
    }

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

  function createThumbnail(photo, index){
    var imageUrl = photo.getUrl();
    var photosetElement = document.getElementById("photoset");

    var link = document.createElement('a');
    link.setAttribute('href', '#');
    link.onclick = function () {
      showLightbox(this);
      return false;
    };

    var thumbnail = document.createElement('div');
    thumbnail.setAttribute('class', 'square');
    thumbnail.setAttribute('id', index);
    thumbnail.style.backgroundImage = "url(" + imageUrl + ")";

    link.appendChild(thumbnail);
    photosetElement.appendChild(link);
  }

  function showLightbox(image){
    var photoIndex = image.getElementsByTagName("div")[0].getAttribute('id');
    var photo = lightboxPhotos.getPhoto(photoIndex);

    lightboxPhotos.setCurrentPhoto(photoIndex);

    createLightboxImage(photo);

    var windowWidth = document.body.clientWidth;
    var windowHeight = document.body.clientHeight;

    var overlay = document.getElementById("overlay");
    overlay.style.display = 'block';
    overlay.style.height = windowHeight;

    var closeBtn = document.getElementById('close-btn');
    var rightArrow = document.getElementById('right-arrow');
    var leftArrow = document.getElementById('left-arrow');
    var photoTitle = document.getElementById('photo-title');

    closeBtn.style.display = 'block';
    rightArrow.style.display = 'block';
    leftArrow.style.display = 'block';
    photoTitle.style.display = 'block';
    photoTitle.innerHTML = photo.getTitle();

    //disable scrolling when lightbox is open
    document.body.className += 'disableScrolling';

    //listen for key presses
    document.onkeydown = getKey;

  }

  function createLightboxImage(photo){
    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    
    var lightboxImg = document.getElementById('lightbox');
    var photoTitle = document.getElementById('photo-title');

    lightboxImg.style.display = 'block';
    lightboxImg.setAttribute('src', photo.getUrl());

    photoTitle.innerHTML = photo.getTitle();
  }


  function navigate(key){
    var limit = function(key) {
      if (key == "right") return lightboxPhotos.getNumberOfPhotos() - 1;
      else if (key == "left") return 0;
    };

    var next = function(key) {
      if (key == "right") return parseInt(photoIndex)+1;
      else if (key == "left") return parseInt(photoIndex) - 1 ;
    };

    var photoIndex = lightboxPhotos.getCurrentPhoto();
    var nextPhoto = photoIndex == limit(key) ? photoIndex : next(key);

    lightboxPhotos.setCurrentPhoto(nextPhoto);
    createLightboxImage(lightboxPhotos.getPhoto(nextPhoto));
  }


  function hideLightbox(){
    var lightboxImg = document.getElementById('lightbox');
    var overlay = document.getElementById("overlay");
    var closeBtn = document.getElementById("close-btn");
    var rightArrow = document.getElementById("right-arrow");
    var leftArrow = document.getElementById("left-arrow");
    var photoTitle = document.getElementById("photo-title");

    //hide all lightbox elements
    lightboxImg.style.display = 'none';
    overlay.style.display = 'none';
    closeBtn.style.display = 'none';
    rightArrow.style.display = 'none';
    leftArrow.style.display = 'none';
    photoTitle.style.display = 'none';

    //remove "disableScrolling" class so page is once again scrollable
    document.body.className = document.body.className.replace( /(?:^|\s)disableScrolling(?!\S)/g , '' );

    //stop listening for key press
    document.onkeydown = null;
  }


  function getKey(e){
    e = e || window.event;

    if (e.keyCode === 39 || e.keyCode === 37) {
      if (e.keyCode === 39) {
        key = "right";
        navigate("right");
      } else if (e.keyCode === 37) {
        key = "left";
        navigate("left");
      }
    }
  }

window.onload = function () {
  initLightbox();
}

})();
