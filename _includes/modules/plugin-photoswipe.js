/* photoswipe.js gallery */

var initPhotoSwipeFromDOM = function(gallerySelector) {

    /* parse slide data (url, title, size ...) from DOM elements */
    /* (children of gallerySelector) */
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; /* <figure> element */

            /* include only element nodes */
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; /* <a> element */

            size = linkEl.getAttribute('data-size').split('x');

            /* create slide object */
              if ( linkEl.getAttribute('data-type') == 'video') {
                item = {
                  html: linkEl.getAttribute('data-video')
                };
              } else {
                item = {
                  src: linkEl.getAttribute('href'),
                  w: parseInt(size[0], 10),
                  h: parseInt(size[1], 10)
                };
              }

            if(figureEl.children.length > 1) {
                /* <figcaption> content */
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                /* <img> thumbnail element, retrieving thumbnail url */
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; /* save link to element for getThumbBoundsFn */
            items.push(item);
        }

        return items;
    };

    /* find nearest parent element */
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    /* triggers when user clicks on thumbnail */
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        /* find root element of slide */
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        /* find index of clicked item by looping through all child nodes */
        /* alternatively, you may define index via data- attribute */
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }

        if(index >= 0) {
            /* open PhotoSwipe if valid index found */
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        /* define options (if needed) */
        options = {

            maxSpreadZoom: 1,
            barsSize: { top: 40, bottom: 70 },
            captionEl: true,
            fullscreenEl: false,
            zoomEl: false,
            shareEl: false,
            counterEl: false,
            history: false,
            bgOpacity: 0.94,
            tapToClose: true,
            tapToToggleControls: false,
            clickToCloseNonZoomable: false,

            getDoubleTapZoom: function (isMouseClick, item) {
                return item.initialZoomLevel;
            },

            getThumbBoundsFn: function(index) {
                /* See Options -> getThumbBoundsFn section of documentation for more info */
                var thumbnail = items[index].el.getElementsByTagName('img')[0], /* find thumbnail */
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        options.index = parseInt(index, 10);

        /* exit if index not found */
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        /* Pass data to PhotoSwipe and initialize it */
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);

        gallery.init();

        /* pause video on close */
        gallery.listen('close', function() {
            if(document.getElementById("gallery-video")){
                document.getElementById("gallery-video").pause();
            }
        });

        /* pause video on change */
        gallery.listen('beforeChange', function() {
            if(document.getElementById("gallery-video")){
                document.getElementById("gallery-video").pause();
            }
        });

    };

    /* loop through all gallery elements and bind events */
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

};

/* execute above function */
initPhotoSwipeFromDOM('.project-gallery');