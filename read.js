/* @todo
 * This code needs a much more robust strategy than what's happening now in order to get real accuracy.
 * My basic idea is that, rather than listening for scrolling and checking for specific positions, we should
 * instead try to build a "scroll path history", which we can then analyze for patterns at key moments
 * (e.g. right before the bottom of the article comes on screen and on beforeunload) to determine whether
 * and to what degree the story was read, which we can then use to trigger events on the fly or to save as
 * analytics. 
 *
 * The scroll history I'm talking about would probably be a simple sequence of scrolling deltas (which would
 * capture direction; negative deltas for scrolling up and positive for scrolling down) recorded at consistent,
 * frequent intervals (e.g. 50ms), which would capture time. The sequence would only start once the user is
 * scrolling within the article body (i.e. it's somewhat onscreen) for the first time. Then, if they go outside
 * of the article body at any point, the sequence at that timespot would hold, maybe, -[Huge #] if they went out
 * of it going up and +[Huge #] if they went out of it going down. [Huge #] might be document height. Trying to
 * find something that numerically captures the significance of that they've stopped reading, while allowing the
 * possibility that they may be going out temporarily (e.g on a scroll overshoot) and will come back. [maybe just
 * check if they do].
 *
 * Then the patterns we'd look for would be things like a sudden change in scroll speed from slow to fast
 * going down (user was reading but skipped to the bottom) or a bunch of slow, alternating up and down
 * scrolls (user reading carefully), etc.
 */
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