(function($) {
    $.fn.read = function(options) {

        if(this.length==0) return this;

        options = $.extend({
                        'wordsPerSecond': 25     
                    }, options);


        var $window       = $(window),
            $article      = this.eq(0), //assume only one article passed to plugin for now.    
            loadedAt      = new Date(),    //calculate this on plugin load in case of ajax-loaded articles
            lastScrollTop = 0,
            windowHeight,
            articleHeight,
            articleBottom,

            data = {
                "loadedAt": +loadedAt,
                "wordCount": $article.html().split(" ").length,
                "readAfter": false,
                "percentScrolled": 0,
                "timeElapsed": 0,                      
            };

                
        function adaptToWindowSize() {            
            windowHeight  = $window.height();
            articleHeight = $article.innerHeight();
            articleBottom = $article.offset()['top'] + articleHeight;
        }

        function scrollListener() {
            var scrollTop   = $window.scrollTop(),
                timeElapsed = (new Date() - loadedAt)/1000,
                read        = isRead(scrollTop, timeElapsed);
            
            /* @todo percentScrolled shouldn't count scrolling when the article is wholly off-screen */
            data.percentScrolled += Math.abs(scrollTop-lastScrollTop)/articleHeight;  
            lastScrollTop = scrollTop;
                        
            if(read && data.readAfter == false) {
                data.readAfter = timeElapsed;
                data.timeElapsed = timeElapsed;

                $article.trigger('read.read', [data]);
            }
        };

        function isRead(scrollTop, timeElapsed) {
            var bottomShown           = scrollTop + windowHeight >= articleBottom,
                sufficientTimeElapsed = timeElapsed >= data.wordCount/options.wordsPerSecond;
                
            return (bottomShown && sufficientTimeElapsed); 
        }
                
        function beforeunloadListener(event) {
            // trigger scroll listener in case, since the last scroll, enough extra
            // time has elapsed such that the user could have finished the article.
            scrollListener();
            data.timeElapsed = (new Date() - loadedAt)/1000;
            
            var x = $article.trigger('finalread.read', [data]); 
                        
            // onbeforeunload hack that attempts to force the callback to be run
            // by making it necessary to calculate the return value. Still weird cross-browser.
            event.originalEvent.returnValue = (x.length === Infinity) ? 'blah' : null;
            return (x.length === Infinity) ? 'blah' : null;
        }


        //init
        adaptToWindowSize();
        $window.on('scroll.read', scrollListener);
        $window.on('resize.read', adaptToWindowSize);           
        $window.on('beforeunload.read', beforeunloadListener);
        $window.on('unload.read', beforeunloadListener);
                
        //returning this to enable chaining
        return this;
    }
})(jQuery);