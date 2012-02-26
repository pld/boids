(function($){
$.fn.replaceText = function( search, replace, text_only ) {
    return this.each(function(){
      var node = this.firstChild,
        val,
        new_val,
        
        // Elements to be removed at the end.
        remove = [];
      
      // Only continue if firstChild exists.
      if ( node ) {
        
        // Loop over all childNodes.
        do {
          
          // Only process text nodes.
          if ( node.nodeType === 3 ) {
            
            // The original node value.
            val = node.nodeValue;
            
            // The new value.
            new_val = val.replace( search, replace );
            
            // Only replace text if the new value is actually different!
            if ( new_val !== val ) {
              
              if ( !text_only && /</.test( new_val ) ) {
                // The new value contains HTML, set it in a slower but far more
                // robust way.
                $(node).before( new_val );
                
                // Don't remove the node yet, or the loop will lose its place.
                remove.push( node );
              } else {
                // The new value contains no HTML, so it can be set in this
                // very fast, simple way.
                node.nodeValue = new_val;
              }
            }
          }
          
        } while ( node = node.nextSibling );
      }
      
      // Time to remove those elements!
      remove.length && $(remove).remove();
    });
  };  
  
})(jQuery);

REPLACE_WORDS_IN = {
            a: 1, b: 1, big: 1, body: 1, cite:1, code: 1, dd: 1, div: 1,
            dt: 1, em: 1, font: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
            i: 1, label: 1, legend: 1, li: 1, p: 1, pre: 1, small: 1,
            span: 1, strong: 1, sub: 1, sup: 1, td: 1, th: 1, tt: 1
};

function shouldAddChildren(el) {
    return el.tagName && REPLACE_WORDS_IN[el.tagName.toLowerCase()];
}

function addWords(el) {
    var textEls = [];
    
    function shouldAddChildren(el) {
        return el.tagName && REPLACE_WORDS_IN[el.tagName.toLowerCase()];
    }
    
    function buildTextEls(el, shouldAdd) {
        var i, len;
        if (shouldAdd && el.nodeType === Node.TEXT_NODE &&
                el.nodeValue.trim().length > 0) {
            textEls.push(el);
            return;
        }
        if (!el.childNodes) {
            return;
        }
        shouldAdd = shouldAddChildren(el);
        for (i = 0, len = el.childNodes.length; i < len; i++) {
            buildTextEls(el.childNodes[i], shouldAdd);
        }
    }
    
    function wordsToSpans(textEl) {
        $(textEl.parentNode).replaceText(/(\S)/g, "<span class='bird' onclick='off = $(this).offset();$(this).attr(\"ox\", off.left);$(this).attr(\"oy\", off.top);'>$1</span>");
    }
    buildTextEls(el, shouldAddChildren(el));
    textEls.map(wordsToSpans);
}


var boids = {
    MAX_BIRDS: 100,
    birds: [],
    birdsReturning: [],
    px: function(x) { return [x, 'px'].join(''); },
    calcVelocity: function(j, J, cJ, dJ, vJ, mouse_j, B) {
        // Flock center
        v = (cJ / B - j) / b[3]
            // Collision avoidance with line-in-sight items
            + dJ / 9
            // Average velocity of line-in-sight flock
            + (vJ / B - J) / 15
            // Mouse gravity
            + (mouse_j - j) / b[4];
        return v;
    },
    makeBoids: function() {
        var i = 0;
        $(".bird").each(function() {
            if (i < boids.MAX_BIRDS) {
                $(this).click();
                while ($(this).attr('ox') == undefined && $(this).attr('oy') == undefined) {};
                ox = parseFloat($(this).attr('ox'));
                oy = parseFloat($(this).attr('oy'));
                oz = parseFloat($(this).css('font-size'));
                // Break symmetry
                oz += Math.random() - 0.5;

                boids.birds[i++] = {
                    x: ox,
                    y: oy,
                    z: oz,
                    X: 0,
                    Y: 0,
                    Z: 0,
                    w: 0,
                    W: 0,
                    elem: $(this).clone().appendTo('body'),
                    orig_elem: $(this)
                }
                $(this).removeClass('bird');
            } else { return; }
        });
        console.log("going to reposition");
        for (i = 0; i < this.birds.length; i++) {
            this.birds[i].elem.css({
              position: "absolute",
              left: this.birds[i].x,
              top: this.birds[i].y,
            });
            // hide original
            this.birds[i].orig_elem.css({ visibility: 'hidden' });
        }
    },
    swarm: function() {
        for (i = 0; i < boids.birds.length; i++) {
            A = boids.birds[i];
            with (A) {
                // Calculate boid movement
                // B: Amount of boids affecting (inside line of sight)
                // K: inner loop index
                // cX: center X
                // cY: center Y
                // cZ: center Z
                // dX: dist X
                // dY: dist Y
                // dZ: dist Z
                // vX: avg velocity X
                // vY: avg velocity Y
                // vZ: avg velocity Z
                // S: other boid
                // Initialize obstacle draw value at increment
                for (B = K = cX = cY = cZ = dX = dY = dZ = vX = vY = vZ = 0;
                    S = boids.birds[K++];) {

                    // A: distance between boids
                    // Count line-of-sight items
                    // Tight swarm with below, hard to perceive size spread
                    //(A = pow(x-S.x, 2) + pow(y-S.y, 2) + pow(z-S.z, 2)) 
                    (A = pow(x-S.x, 2) + pow(y-S.y, 2)) < b[7] && (
                        B++,
                        cX += S.x,
                        cY += S.y,
                        cZ += S.z,
                        vX += S.X,
                        vY += S.Y,
                        vZ += S.Z
                    );
                    // Collision avoidance
                    // Introduces "feature", real would be (S.W?3*b[5]:b[2])
                    // I forgot what the "feature" is, sorry. Something useful,
                    // I guess.
                    A < S.W * 3 * b[5] + b[2] && (
                        dX -= S.x - x,
                        dY -= S.y - y,
                        dZ -= S.z - z
                    )
                }

                // Calculate velocity, X coord
                X += boids.calcVelocity(x, X, cX, dX, vX, mouse_x, B); 

                y > b[0] | w ? (
                    // Starting perch/rest, or already doing it
                    // Stop the item and place it onto ground
                    y = b[X = 0],
                    // -5 starting velocity, also makes boid "stand" in the ground
                    Y = -5,
                    // Reduce or set perch time
                    w = w ? w - 1 : b[6] | 0 // |0 = floor, w must be integer
                ) : // Calculate Y velocity (similar to X above)
                    Y += boids.calcVelocity(y, Y, cY, dY, vY, mouse_y, B); 

                // Calculate Z velocity, no mouse gravity
                Z += boids.calcVelocity(z, Z, cZ, dZ, vZ, z, B);

                // speed limiter
                // C: Shortcut for max speed setting
                C = b[1];
                X /= d(X) > C ? d(X) / C : 1;
                Y /= d(Y) > C ? d(Y) / C : 1;
                Z /= d(Z) > C ? d(Z) / C : 1;

                // Move and draw item
                // fillStyle is #888 set for obstacle already
                // strokeStyle will be red for boid
                x += X;
                y += Y;

                // min font-size of 5, max font-size of 32
                if (z < minSize && Z < 0) Z = -Z;
                if (z > maxSize && Z > 0) Z = -Z;
                z += Z;

                if (x < 0  || x > window.innerWidth - 1 || y < 0 ||
                      y > window.innerHeight -1) { 
                    X = -X;
                    Y = -Y;
                }

                elem.css({
                    position: "absolute",
                    left: x,
                    top: y,
                    'font-size': boids.px(z)
                });

            } // End of with(A)
        }
    },
    returnHome: function() {
        //$('.bird').addClass('bird-home');
        boids.birdsReturning = boids.birds.slice();
        $('.bird').removeClass('bird');
        setTimeout(boids.goHome, 50);
    },
    goHome: function() {
        var i = 0;
        epsilon = 1E-2;
        for (; i < boids.birdsReturning.length; i++) {
            A = boids.birdsReturning[i];
            with (A) {
                ox = parseFloat(orig_elem.attr('ox'));
                oy = parseFloat(orig_elem.attr('oy'));
                oz = parseFloat(orig_elem.css('font-size'));
                if (d(ox - x) + d(oy - y) + d(oz -z) < epsilon) {
                     x = ox;
                     y = oy;
                     z = oz;
                     boids.birdsReturning.splice(1, i);
                } else {
                    ((x > ox) && (x -= d(X))) || (x < ox && (x += d(X)));
                    ((y > oy) && (y -= d(Y))) || (y < oy && (y += d(Y)));
                    ((z > oz) && (z -= d(Z))) || (z < oz && (z += d(Z)));
                    X = d(ox - x) / 2;
                    Y = d(oy - y) / 2;
                    Z = d(oz - z) / 2;
                }
                elem.css({
                    position: "absolute",
                    left: x,
                    top: y,
                    'font-size': boids.px(z)
                });
            }
        }
        if (boids.birdsReturning.length > 0)
            setTimeout(boids.goHome, 50);
    },
    landAndFlyBoids: function(event) {
        boids.returnHome($(this));
        console.log('calling addWords');
        $(this).unbind(event);
        addWords(this);
        boids.makeBoids();
        $(this).click(boids.landAndFlyBoids);
    }
}
 

$(document).ready(function() {
    $('p').click(boids.landAndFlyBoids)

    // b: settings array:
    // #  inc dec meaning
    // 0: B   C   Grass height
    // 1: D   E   Maximum velocity
    // 2: F   G   Minimum distance 
    // 3: H   I   Flock center "gravity"
    // 4: J   K   Goal (mouse) "gravity"
    // 5: L   M   Obstacle size
    // 6: N   O   Perching time
    // 7: P   Q   Boid line of sight
    //   0    1  2  3    4    5  6   7
    b = [7000, 5, 81, 1E5, 1E3, 9, 99, 3600];

    d = Math.abs;
    pow = Math.pow;
    minSize = 9;
    maxSize = 50;
    mouse_x = 100, mouse_y = 100;
 
    $('body').mousemove(function(e) {
        mouse_x = e.pageX;
        mouse_y = e.pageY;
    });

    setInterval(boids.swarm, 50);
});
