jQuery.fn.read = function(options) {
    
    var $this        = $(this),
        $window      = $(window),
        windowHeight = $window.height()
        loadedAt     = new Date(),
        options      = $.extend({
                        'wordsPerSecond': 25      
                       }, options);

        article  = {
            bottom: $this.eq(0).offset()['top'] + $this.eq(0).innerHeight(),
            wordCount: $this.eq(0).html().split(" ").length
        },
            
        readListener = function() {
            var scrollTop = $window.scrollTop(),
                time = new Date() - loadedAt,
                read = (scrollTop + windowHeight >= article.bottom && time >= article.wordCount/options.wordsPerSecond);

            if(read) {
                $this.trigger('read', [article]);
                $window.off("scroll.read", readListener);
            }
        };
    
    $(window).on('scroll.read', readListener);
    
     //returning this.each enables chaining
    return this;
}