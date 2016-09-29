/*
 * lightbox.js
 * Author: Erin Bush
 * Created: September 23, 2016
 *
 * A lightbox viewer for a Flickr Photoset.  The relevant photoset information is
 * passed in through an html element with the api key, photoset id,
 * user id, number of photos per page, and the starting page number
 *
 */


(function (){

  /**
   * Object: FlickrPhoto
   *
   * used to store all relevant information about a specific photo
   */

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

  /**
   * Object: Photoset
   *
   * holds all the photos in a Flickr photoset
   * also contains all relevant information about the photoset
   */

  function PhotoSet(id, page, photosPerPage, apiKey, userId){
    this.photosetId = id;
    this.page = page;
    this.photosPerPage = photosPerPage;
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
    },
    setTotal: function(total){
      this.total = total;
    },
    getTotal: function(){
      return this.total;
    },
    setTitle: function(title){
      this.photosetTitle = title;
    },
    getTitle: function(){
      return this.photosetTitle;
    }
  }

  var lightboxPhotos;

  /**
   * Function: initLightbox()
   *
   * gets information from html element about the Flickr photoset to be displayed
   * and starts the process of creating the gallery
   */
  function initLightbox() {
    //get Flickr photoset values from html element
    var photosetElement = document.getElementById("photoset"),
        api_key = photosetElement.getAttribute('api-key'),
        photoset_id = photosetElement.getAttribute('photoset-id'),
        user_id = photosetElement.getAttribute('user-id'),
        per_page = photosetElement.getAttribute('per-page'),
        page = photosetElement.getAttribute('page');

    //create all document elements but don't display them until lightbox is shown
    createLightboxElements();

    lightboxPhotos = new PhotoSet(photoset_id, page, per_page, api_key, user_id);

    getImagesFromServer(lightboxPhotos.getUrl());
  }

  /**
   * Function: createLightboxElements()
   *
   * creates all the html elements that are used when the lightbox is displayed
   * and also elements that are displayed with the gallery of images (Load More
   * Photos button and the photoset title)
   */
  function createLightboxElements() {
    var overlay = document.createElement('div'),
        lightboxImg = document.createElement('img'),
        closeBtn = document.createElement('a'),
        closeBtnImg = document.createElement('img'),
        rightArrow = document.createElement('a'),
        rightArrowImg = document.createElement('img'),
        leftArrow = document.createElement('a'),
        leftArrowImg = document.createElement('img'),
        title = document.createElement('div'),
        buttonContainer = document.createElement('div'),
        addMoreBtn = document.createElement('a'),
        addMoreText = document.createTextNode("Load More Images"),
        photosetTitle = document.createElement('div'),
        finalStar = document.createElement('img'),
        main = document.getElementById("main-content");

    overlay.setAttribute('class', 'overlay');
    overlay.setAttribute('id', 'overlay');
    overlay.onclick = hideLightbox;
    document.body.appendChild(overlay);

    lightboxImg.setAttribute('id', 'lightbox');
    lightboxImg.setAttribute('class', 'lightbox-img');
    document.body.appendChild(lightboxImg);

    closeBtn.setAttribute('class', 'close-btn');
    closeBtn.setAttribute('id', 'close-btn');
    closeBtn.onclick = hideLightbox;
    closeBtnImg.setAttribute('src', 'xbutton.png');
    closeBtn.appendChild(closeBtnImg);
    document.body.appendChild(closeBtn);

    rightArrow.setAttribute('class', 'right-arrow');
    rightArrow.setAttribute('id','right-arrow');
    rightArrow.onclick = function () {
      navigate("right");
      return false;
    };
    rightArrowImg.setAttribute('src', 'right-arrow.png');
    rightArrow.appendChild(rightArrowImg);
    document.body.appendChild(rightArrow);

    leftArrow.setAttribute('class', 'left-arrow');
    leftArrow.setAttribute('id', 'left-arrow');
    leftArrow.onclick = function () {
      navigate("left");
      return false;
    };

    leftArrowImg.setAttribute('src', 'left-arrow.png');
    leftArrow.appendChild(leftArrowImg);
    document.body.appendChild(leftArrow);

    title.setAttribute('class', 'photo-title');
    title.setAttribute('id', 'photo-title');
    document.body.appendChild(title);

    //add an element for the photoset title
    photosetTitle.setAttribute('id', 'photoset-title');
    photosetTitle.setAttribute('class', 'photoset-title');
    main.insertBefore(photosetTitle, document.getElementById('photoset'));

    //add a button to load more photos
    buttonContainer.setAttribute('class', 'addmore-container');
    addMoreBtn.setAttribute('href', 'javascript:void(0)');
    addMoreBtn.setAttribute('class', 'addmore-btn');
    addMoreBtn.setAttribute('id', 'addmore-photos');
    addMoreBtn.appendChild(addMoreText);
    addMoreBtn.onclick = loadMoreImages;
    buttonContainer.appendChild(addMoreBtn);
    main.appendChild(buttonContainer);

    finalStar.setAttribute('src', "star.png");
    finalStar.setAttribute('class', 'final-star');
    finalStar.setAttribute('id', 'final-star');
    main.appendChild(finalStar);
  }

  function getImagesFromServer(url){
      var xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
           if (xhttp.status == 200) {
             createPhotos(xhttp.responseText);
           }
           else {
             //TODO: display message to user
             console.log("Error", xhttp.statusText);
           }
        }
      };

      xhttp.open("GET", url, true);
      xhttp.send();

      return xhttp;
  }

  /**
   * Function: LoadMoreImages()
   *
   * called when the user clicks the button to load the next set of photos in
   * the photoset - holds the logic to choose which page of photos to retrieve from
   * Flickr
   */
  function loadMoreImages() {
    var currentPage = parseInt(lightboxPhotos.getPage()),
        totalPages = parseInt(lightboxPhotos.getNumberOfPages());

    if ( currentPage < totalPages ){
      currentPage++;
      lightboxPhotos.setPage(currentPage);
      getImagesFromServer(lightboxPhotos.getUrl());
    }
    if (currentPage >= totalPages){
      removeLoadMoreButton();
    }
  }

  function removeLoadMoreButton(){
    var addMoreBtn = document.getElementById('addmore-photos');
    var finalStar = document.getElementById('final-star');
    addMoreBtn.style.display = 'none';
    finalStar.style.display = 'block';
  }

  /**
   * Object: createPhotos()
   *
   * takes the xml photoset object and pushes the photos into
   * an array that is kept in the variable lightboxPhotos and creates a thumbnail
   * for each photo for the gallery
   */
  function createPhotos(xmlPhotos){
    var photosObj = parseXML(xmlPhotos),
        photoset = photosObj.getElementsByTagName("photoset")[0],
        photos = photosObj.getElementsByTagName("photo"),
        photosetTitle = document.getElementById("photoset-title"),
        index;

    if(!photoset){
      photosetTitle.innerHTML = "There was an error retrieving the photos";
      removeLoadMoreButton();

    } else if(lightboxPhotos.getNumberOfPhotos() == 0){
      lightboxPhotos.setNumberOfPages(photoset.getAttribute('pages'));
      lightboxPhotos.setTotal(photoset.getAttribute('total'));
      lightboxPhotos.setTitle(photoset.getAttribute('title'));

      photosetTitle.innerHTML = lightboxPhotos.getTitle();

      index = 0;
    } else {
      index = lightboxPhotos.getNumberOfPhotos();
    }

    for (i = 0; i < photos.length; i++) {
        var photo = new FlickrPhoto(photos[i].getAttribute('server'), photos[i].getAttribute('farm'),
              photos[i].getAttribute('id'), photos[i].getAttribute('secret'),photos[i].getAttribute('title'));

        lightboxPhotos.addPhoto(photo);

        createThumbnail(photo, index);
        index ++;
    }

  }

  /**
   * Function: parseXML()
   *
   * Translates the text returned from the server into an xml object
   */
  function parseXML(text){
      var xmlObject;
      if (window.DOMParser){
        var parser = new DOMParser();
        xmlObject = parser.parseFromString(text,"text/xml");
      }
      else { //IE support
        xmlObject=new ActiveXObject("Microsoft.XMLDOM");
        xmlObject.async=false;
        xmlObject.loadXML(text);
      }
      return xmlObject;
  }


  /**
   * Object: createThumbnail()
   *
   * creates an html element of the photo passed in as an argument for the gallery
   */
  function createThumbnail(photo, index){
    var imageUrl = photo.getUrl(),
        photosetElement = document.getElementById("photoset"),
        link = document.createElement('a'),
        thumbnail = document.createElement('div');

    link.setAttribute("href", "javascript:void(0)");
    link.onclick = function () {
      showLightbox(this);
      return false;
    };

    thumbnail.setAttribute('class', 'square');
    thumbnail.setAttribute('id', index);
    thumbnail.style.backgroundImage = "url(" + imageUrl + ")";

    link.appendChild(thumbnail);
    photosetElement.appendChild(link);
  }

  /**
   * Function: showLightbox()
   *
   * Makes all of the html elements that are required for the lightbox visible such
   * as the right and left arrow buttons, the photo title, and the close button
   */
  function showLightbox(image){
    var photoIndex = image.getElementsByTagName("div")[0].getAttribute('id'),
        photo = lightboxPhotos.getPhoto(photoIndex),
        overlay = document.getElementById("overlay"),
        closeBtn = document.getElementById('close-btn'),
        rightArrow = document.getElementById('right-arrow'),
        leftArrow = document.getElementById('left-arrow'),
        photoTitle = document.getElementById('photo-title');

    lightboxPhotos.setCurrentPhoto(photoIndex);
    createLightboxImage(photo);

    //show elements used in the lightbox display
    overlay.style.display = 'block';
    overlay.style.height = getWindowHeight();
    closeBtn.style.display = 'block';
    rightArrow.style.display = 'block';
    leftArrow.style.display = 'block';
    photoTitle.style.display = 'block';
    photoTitle.innerHTML = photo.getTitle();

    //disable scrolling when lightbox is open
    document.body.className += 'disable-scrolling';

    //listen for key presses
    document.onkeydown = getKey;

  }

  /**
   * Function: createLightboxImage()
   *
   * Sets the url of the enlarged lightbox image to that of the current photo
   */
  function createLightboxImage(photo){
    var lightboxImg = document.getElementById('lightbox'),
        photoTitle = document.getElementById('photo-title');

    lightboxImg.style.display = 'block';
    lightboxImg.setAttribute('src', photo.getUrl());

    photoTitle.innerHTML = photo.getTitle();
  }

  /**
   * Function: navigate
   *
   * Takes in the key that has been pressed and determines the direction to
   * navigate in the lightbox view (which image to display next)
   */
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

  /**
   * Function: hideLightbox()
   *
   * Hides all html elements that are used for the lightbox
   */
  function hideLightbox(){
    var lightboxImg = document.getElementById('lightbox'),
        overlay = document.getElementById("overlay"),
        closeBtn = document.getElementById("close-btn"),
        rightArrow = document.getElementById("right-arrow"),
        leftArrow = document.getElementById("left-arrow"),
        photoTitle = document.getElementById("photo-title");

    //hide all lightbox elements
    lightboxImg.style.display = 'none';
    overlay.style.display = 'none';
    closeBtn.style.display = 'none';
    rightArrow.style.display = 'none';
    leftArrow.style.display = 'none';
    photoTitle.style.display = 'none';

    //remove "disableScrolling" class so page is once again scrollable
    document.body.className = document.body.className.replace( /(?:^|\s)disable-scrolling(?!\S)/g , '' );

    //stop listening for key press
    document.onkeydown = null;
  }

  /**
   * Function: getKey()
   *
   * the event handler for the 'onkeydown' event that gets the key code value
   * from the keyboard and determines if the right or left arrow was pressed
   */
  function getKey(e){
    e = e || window.event;

    if (e.keyCode === 39 || e.keyCode === 37) {
      if (e.keyCode === 39) {
        navigate("right");
      } else if (e.keyCode === 37) {
        navigate("left");
      }
    }
  }

  /**
   * Function: getWindowHeight()
   *
   * returns the hieght of the browser window
   */
  function getWindowHeight(){
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }

  window.onload = function () {
    initLightbox();
  }

})();
