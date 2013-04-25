jQuery.fn.onRead = function(callback) {
    
    var $this        = $(this),
        $window      = $(window),
        windowHeight = $window.height()
        loadedAt     = new Date();

        article  = {
            bottom: $this.eq(0).offset()['top'] + $this.eq(0).innerHeight(),
            wordCount: $this.eq(0).html().split(" ").length
        },
            
        readListener = function() {
            var scrollTop = $window.scrollTop(),
                time = new Date() - loadedAt,
                read = (scrollTop + windowHeight >= article.bottom && time >= article.wordCount/50);

            if(read) {
                callback($this, article);
                $window.off("scroll.read", readListener);
            }
        };
    
    $(window).on('scroll.read', readListener);
    
     //returning this.each enables chaining
    return this;
}