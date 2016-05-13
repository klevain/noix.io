/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // Check to see if there's an updated version of service-worker.js with
      // new files to cache:
      // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-registration-update-method
      if (typeof registration.update === 'function') {
        registration.update();
      }

      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  console.log('BANZAÏ !');
  var DELAY = 600;
  var h;
  var s;
  var l;
  var a;
  var $main;
  var $color;
  var $slide;
  var $slides;
  var $section;
  var $caption;
  var fullpageSettings;

  // Define fullpage plugin settings;
  fullpageSettings = {
    // Custom selectors
    sectionSelector: 'section',
    slideSelector: 'figure',
    loopHorizontal: false,
    controlArrows: false,
    verticalCentered: false,
    scrollingSpeed: DELAY,
    afterLoad: function() {
      $('.fp-controlArrow').addClass('fp-init');
    },
    onLeave: function(index, nextIndex) {
      nextIndex -= 1;
      var $nextSect = $('section:eq(' + nextIndex + ')');
      var $nextSlide = $('figure.active', $nextSect);
      var $innerSlides = $('figure', $nextSect);

      // Hide the active caption
      $('section.active figure.active figcaption.active').removeClass('active');

      // hidding it for the fist section, showing for the rest
      $('nav .fp-up').toggleClass(
        'fp-inactive',
        nextIndex === 0
      );
      // hidding it for the last section, showing for the rest
      $('nav .fp-down').toggleClass(
        'fp-inactive',
        $nextSect.is(':last-child')
      );

      // hidding it for the fist slide or for one item list, showing for the rest
      $('nav .fp-prev').toggleClass(
        'fp-inactive',
        $nextSlide.is($innerSlides.get(0)) || $innerSlides.length === 1
      );
      // hidding it for the last slide or for one item list, showing for the rest
      $('nav .fp-next').toggleClass(
        'fp-inactive',
        $nextSlide.is($innerSlides.last()) || $innerSlides.length === 1
      );

      // colorize background
      $('body').animate({backgroundColor: $nextSlide.data('color')}, DELAY);
    },
    onSlideLeave: function(
      anchorLink,
      index,
      slideIndex,
      direction,
      nextSlideIndex) {
      var $nextSlide = $('section.active figure:eq(' + nextSlideIndex + ')');

      // Hide the active caption
      $('section.active figure.active figcaption.active').removeClass('active');

      // hidding it for the fist slide, showing for the rest
      $('nav .fp-prev').toggleClass(
        'fp-inactive',
        nextSlideIndex === 0
      );
      // hidding it for the last slide, showing for the rest
      $('nav .fp-next').toggleClass(
        'fp-inactive',
        $nextSlide.is(':last-child')
      );

      // colorize background
      $('body').animate({
        backgroundColor: $nextSlide.data('color')
      }, DELAY);
    },
    afterRender: function() {
      $('body').animate({
        backgroundColor: $slides.first().data('color')
      }, DELAY);
    }
  };

  $main = $('main');

  // Load datas (and structure)
  jQuery.getJSON('scripts/datas.json', function(data) {
    $('body').writeSection(data, function() {
      console.log('Sections writing done');
      $('main').setupSlides();

      $('main').fullpage(fullpageSettings);
      console.log('fullpage done !');
    });
  });

  // Templating task (merge data and tpl to static html batches)
  $.fn.writeSection = function(data, callback) {
    var items = [];
    var tplSection;
    var tplSlide;
    var tplCaption;
    var picturePath;
    var i = 0;
    var gallery;
    var picture;
    var captionTag
    // var galleriesLength;
    // var slideLength;
    // var promise;
    // var j = 0;
    // galleriesLength = data.galleries.length;

    $(data.galleries).each(function(i) {
      gallery = this;
      console.log(gallery);
      tplSection = $('<section data-hue="' + gallery.hue + '" data-lightness="' + gallery.lightness + '" class="gallery" data-anchor="' + ( i + 1 ) + '"></section>');
      $(gallery.pictures).each(function(key, picture) {
        picture = this;
        console.log(picture);
        tplSlide = $('<figure><div class="figwrapper"><div class="imgwrapper"><img class="' + picture.format + '" data-src="' + picture.path + '" alt="' + picture.title + '"></div></div></figure>');
        tplCaption = $('<figcaption></figcaption>');
        $.each(picture.captions, function(index, caption) {
          console.log('-------------------------');
          console.log(index);
          console.log(caption);
          console.log('-------------------------');
          switch (caption[0]) {
            case 'title':
              captionTag = $('<h2>' + caption[1] + '</h2>');
              break;
            case 'layus':
              captionTag = $('<p>' + caption[1] + '</>');
              break;
            default :
              captionTag = $('<p>' + caption[1] + '</p>');
          }
          tplCaption.append(captionTag);
        });
        tplSlide.append(tplCaption);
        tplSection.append(tplSlide);
      });
      $main.append(tplSection);
    }).promise().done(callback);
  };

  // Setup slides colors etc...
  $.fn.setupSlides = function() {
    $slides = $('figure');

    h = Math.round(Math.random() * 359);
    s = 0.6;
    l = 0.8;
    a = 1.0;

    $slides.each(function() {
      $slide = $(this);
      $section = $(this).closest('section');
      $caption = $('figcaption', $slide);
      $color;
      // $color = $color.hsla({
      //   hue: ($slide.is($slides.get(0))) ? (h + 180) % 360 : h,
      //   saturation: s + Math.random() * 0.4,
      //   lightness: l + Math.random() * 0.2,
      //   alpha: a
      // });
      $color = $.Color().hsla({
        hue: $section.data('hue'),
        saturation: s + Math.random() * 0.4,
        lightness: $section.data('lightness'),
        alpha: a
      });
      $slide.data('color', $color.toHexString());
      $caption.css('background-color', $color.toHexString());
      $slide.click(function() {
        $slide = $(this);
        $caption = $('figcaption', $slide);
        console.log('CLICK');
        $caption.toggleClass('active');
      });
    });
    console.log('Slides setted up');
  };
  // Setup main nav plugin (fullpage.js)
  // $('main').fullpage(fullpageSettings);
  // Setup fullpage.js utilites
  // var getActiveSlide = function() {
  //   var $section;
  //   var sectionIndex;
  //   var $slide;
  //   var slideIndex;
  //
  //   $section = $('section.active');
  //   $slide = $('figure.active', $section);
  //
  //   sectionIndex = $section.index();
  //   slideIndex = $slide.index();
  //
  //   return [sectionIndex, slideIndex];
  // };
  // Nav controls mapping.
  $('.fp-up').click(function() {
    $.fn.fullpage.moveSectionUp();
  });
  $('.fp-down').click(function() {
    $.fn.fullpage.moveSectionDown();
  });
  $('.fp-prev').click(function() {
    $.fn.fullpage.moveSlideLeft();
  });
  $('.fp-next').click(function() {
    $.fn.fullpage.moveSlideRight();
  });
  $(document).keyup(function(e) {
    // enter
    if (e.keyCode === 13) {
      // try go next slide then/or try next section
    }
    // esc
    if (e.keyCode === 27) {
      // Go back home !
      $.fn.fullpage.moveTo(0, 0);
    }
  });

  // Go back home !
  $('header').click(function() {
    $.fn.fullpage.moveTo(0, 0);
  });
})();
