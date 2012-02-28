

var interval = null;

// http://benalman.com/projects/jquery-replacetext-plugin/
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

// liberated from katamari ball src
REPLACE_WORDS_IN = {
            a: 1, b: 1, big: 1, body: 1, cite:1, code: 1, dd: 1, div: 1,
            dt: 1, em: 1, font: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
            i: 1, label: 1, legend: 1, li: 1, p: 1, pre: 1, small: 1,
            span: 1, strong: 1, sub: 1, sup: 1, td: 1, th: 1, tt: 1
};

function shouldAddChildren(el) {
    return el.tagName && REPLACE_WORDS_IN[el.tagName.toLowerCase()];
}

function addLetters(el) {
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
    
    function lettersToSpans(textEl) {
        $(textEl.parentNode).replaceText(/(\S)/g, "<span class='letter' onclick='var event = arguments[0];event.stopPropagation(); off = $(this).offset();$(this).attr(\"ox\", off.left);$(this).attr(\"oy\", off.top);'>$1</span>");
    }
    buildTextEls(el, shouldAddChildren(el));
    textEls.map(lettersToSpans);
}

// Relies heavily on js1k entry by Lauri Paimen: http://lauri.paimen.info/pub/dev/boids/
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
    makeBoid: function(span) {
        console.log("makeBoid");
        if (span.attr('ox') == undefined && span.attr('oy') == undefined) 
            span.click();
            while (span.attr('ox') == undefined && span.attr('oy') == undefined) {};

        ox = parseFloat(span.attr('ox'));
        oy = parseFloat(span.attr('oy'));
        oz = parseFloat(span.css('font-size'));

        if (maxSize < oz) maxSize = oz+3;
        if (minSize >= oz) minSize = oz-3;

        // Break symmetry
        oz += Math.random() - 0.5;

        bird = {
            ox: ox,
            oy: oy,
            oz: oz,
            x: ox,
            y: oy,
            z: oz,
            X: 0,
            Y: 0,
            Z: 0,
            w: 0,
            W: 0,
            elem: span.clone().appendTo('body'),
            orig_elem: span
        };

        bird.elem.css({ 
            visibility: 'visible',
            position: "absolute",
            left: bird.x,
            top: bird.y,
        });

        bird.elem.unbind('mouseover');

        /*
        console.log("makeBoid: hiding span");
        console.log(span.attr('style'));
        span.css({visibility : 'hidden'});
        console.log(span.attr('style'));
        */

        boids.birds.push(bird);
    },

    swarm: function() {
        var absX, absY, absZ;
        var  x_minus_Sx, y_minus_Sy, z_minus_Sz;

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
                    x_minus_Sx = x-S.x;
                    y_minus_Sy = y-S.y;
                    z_minus_Sz = z-S.z;

                    (A = x_minus_Sx*x_minus_Sx + y_minus_Sy*y_minus_Sy) < b[7] && (
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
                        dX += x_minus_Sx,
                        dY += y_minus_Sy,
                        dZ += z_minus_Sz
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
                absX = Math.abs(X);
                absY = Math.abs(Y);
                absZ = Math.abs(Z);
                X /= absX > C ? absX / C : 1;
                Y /= absY > C ? absY / C : 1;
                Z /= absZ > C ? absZ / C : 1;

                // Move and draw item
                x += X;
                y += Y;

                if (z < minSize && Z < 0) Z = -Z;
                if (z > maxSize && Z > 0) Z = -Z;
                z += Z;

                // bounce off walls
                if (x < 0  || x > window.innerWidth - 1 || y < 0 || y > window.innerHeight -1) { 
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
    goHome: function() {
        var birds = boids.birds.slice(0);
        var epsilon = 4;
        var num_returned = 0;
        var interval_period = 50;       // update interval in ms
        var t_slices = 20;              // fewer slices == faster birds
        var t_delta = 1.0  / t_slices;
        var t = 0;

        boids.birds = [];

        for (var i=0; i < birds.length; i++) {
            birds[i].start_x = birds[i].x;
            birds[i].start_y = birds[i].y;
            birds[i].start_z = birds[i].z;
        }

        var _1_minus_t;
        var go_home_interval = setInterval(function() {
            if (num_returned == birds.length) {
                clearInterval(go_home_interval);
                return;
            }

            for (var i=0; i < birds.length; i++) {
                A = birds[i];
                with (A) {
                    dx = ox - x;
                    dy = oy - y;
                    dz = oz - z;

                    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) < epsilon) {
                         x = ox;
                         y = oy;
                         z = oz;
                         X = 0;
                         Y = 0;
                         Z = 0;
                         w = 0;
                         W = 0;
                        
                         elem.remove();
                         orig_elem.css({visibility: 'visible'});

                         ++num_returned;
                    } else {
                        _1_minus_t = 1.0 -t;
                        x = start_x*(_1_minus_t) + ox*t - 1 + 2*Math.random();
                        y = start_y*(_1_minus_t) + oy*t - 1 + 2*Math.random();
                        z = start_z*(_1_minus_t) + oz*t - 1 + 2*Math.random();
                        elem.css({
                            position: "absolute",
                            left: x,
                            top: y,
                            'font-size': boids.px(z)
                        });
                    }
                }
            }
            t += t_delta;
            if (t > 1.0) t = 1.0;
        }, interval_period);
    },
}

$(document).ready(function() {
    addLetters(document.body);
    
    $('.letter').mouseover(function() {
        console.log("handle mouseover");
        $(this).css({ visibility: 'hidden' });
        boids.makeBoid($(this));
        if (boids.birds.length == 1)
            interval = setInterval(boids.swarm, 50);
    });

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

    minSize = 9;
    maxSize = 12;
    mouse_x = 100, mouse_y = 100;
 
    $('body').mousemove(function(e) {
        mouse_x = e.pageX;
        mouse_y = e.pageY;
    });

    $('body, #go-home-btn').click(function() {
        if (boids.birds.length > 0) {
            clearInterval(interval);
            boids.goHome();
        }
    });
});
