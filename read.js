jQuery.fn.read = function(options) {
    
    var $this        = $(this).eq(0), //for now, assume we only have one article
        $window      = $(window),
        windowHeight = $window.height(),
        loadedAt     = new Date(),
        options      = $.extend({
                        'wordsPerSecond': 25      
                       }, options);

        article  = {
            bottom: $this.offset()['top'] + $this.innerHeight(),
            wordCount: $this.html().split(" ").length
        },
            
        readListener = function() {
            var scrollTop = $window.scrollTop(),
                time = (new Date() - loadedAt)/1000,
                read = (scrollTop + windowHeight >= article.bottom && time >= article.wordCount/options.wordsPerSecond);

            if(read) {
                $this.trigger('read', [article]);
                $window.off("scroll.read", readListener);
				$window.off("resize.read", resizeListener);
            }
        };
		
		resizeListener = function() {
			windowHeight = $window.height();
			article.bottom = $this.offset()['top'] + $this.innerHeight();
		}
    
    $window.on('scroll.read', readListener);
    $window.on('resize.read', resizeListener);
    
     //returning this.each enables chaining
    return this;
}