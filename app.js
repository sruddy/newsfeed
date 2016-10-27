(function (window) {

  var nav = document.querySelector('nav'),
    feedOption = nav.querySelectorAll('.feed'),
    feedTitle = document.querySelector('.feed-title'),
    feedContainer = document.querySelector('.news-feed'),
    feedItem = [],
    contentIdArr = [],
    util = window.util;

  // looks for closest parent with classname 'className'
  // closest() is not yet supported on IE or Edge
  function closestClass(currentEl, className) {
    while ((currentEl = currentEl.parentElement) && !currentEl.classList.contains(className));
    return currentEl;
  }

  // Retireves an array of articles IDs or articles the user has clicked on
  function retrieveLocalStorage() {
    contentIdArr = JSON.parse(localStorage.getItem('articleRead'));
  }

  // If the user clicks on an article its ID is stored in local storage
  function saveLocalStorage(e) {
    var closestItem = closestClass(e.target, 'item')
      contentId = closestItem.dataset.id;
    
    closestItem.dataset.visited = true;
    
    retrieveLocalStorage();
    
    contentIdArr = contentIdArr || [];
    contentIdArr.push(contentId);

    localStorage.setItem('articleRead', JSON.stringify(contentIdArr));
    
  }

  function getFeedData() {
    var slug = this.dataset.slug;
      
    feedTitle.textContent = this.dataset.title;
    
    feedContainer.innerHTML = '';

    util.ajax({
      url: 'http://data.digg.com/api/v1/feed/trending/tweets?slug=' + slug,
      headers: {'Content-Type': 'application/json; charset=UTF-8'},
      dataType: 'jsonp',
      success: function (currentFeed) {
        var feedData = currentFeed.mesg;

        for (i = 0; i < feedData.length; i++) {
          var itemFeedData = feedData[i],
            title = itemFeedData.title,
            domain = itemFeedData.domain,
            description = itemFeedData.description,
            articleUrl = itemFeedData.url,
            contentId = itemFeedData.content_id,
            imageUrl = itemFeedData.media.images[0],
            screenName = itemFeedData.screen_names,
            item = document.createElement('article'),
            imageHtml,
            follow = '',
            visited = false;

          // Mark if user has visited this article
          retrieveLocalStorage();
          contentIdArr = contentIdArr || [];
          if (contentIdArr.indexOf(contentId) > -1) {
            visited = true;
          }

          // Set class and data attributes
          item.setAttribute('class', 'item');
          item.setAttribute('data-visited', visited);
          item.setAttribute('data-id', contentId);

          // Only add an image if there is one
          if (imageUrl != null || imageUrl != undefined) {
            imageHtml = '<a class="article img-wrap" href="' + articleUrl + '" target="_blank"><img src="' + imageUrl.url + '"></a>'
          } else {
            item.setAttribute('data-img', 'no-img');
            imageHtml = '';
          }
          
          // Creates a follow button for all screen names
          for (x = 0; x < screenName.length; x++) {
            follow = follow + '<a class="twitter-follow" href="https://twitter.com/' + screenName[x]+ '">Follow @' + screenName[x] + '</a>';
          }

          item.innerHTML = imageHtml +'<div class="content"><a class="article" href="' + articleUrl + '" target="_blank"><h2>' + title + '</h2><span class="domain">' + domain + '</span><p class="description">' + description + '</p></a><div class="social">' + follow + '</div></div>';
          feedContainer.appendChild(item);
        }
        
        // Setting var feedItem now that it exists 
        feedItem = document.querySelectorAll('.article');
        for (var i = 0; i < feedItem.length; i++) {
          feedItem[i].addEventListener('click', saveLocalStorage, false);
        }
      },
      error: function () {
        console.log('error');
      }
    });
  }
  
  function scrollToTop() {
    nav.scrollIntoView();
  }

  for (var i = 0; i < feedOption.length; i++) {
    feedOption[i].addEventListener('click', getFeedData, false);
  }
  
  feedTitle.addEventListener('click', scrollToTop, false);

})(this);
