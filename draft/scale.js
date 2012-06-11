/**
 * Scale: <draft>
 * [kr-only]
 */
"use strict";

var timbre = require("../src/timbre");
// __BEGIN__

var Scale = (function() {
    var Scale = function() {
        initialize.apply(this, arguments);
    }, $this = Scale.prototype;
    
    timbre.fn.setPrototypeOf.call($this, "kr-only");
    
    Object.defineProperty($this, "scale", {
        set: function(value) {
            var _ = this._;
            if (typeof value === "string" &&
                Scale.Scales[value] !== undefined) {
                _.scale = value;
                _.list = Scale.Scales[value];
            } else if (value instanceof Array) {
                _.scale = "";
                _.list = value;
            }
        },
        get: function() { return this._.scale; }
    });
    
    Object.defineProperty($this, "root", {
        set: function(value) {
            this._.root = timbre(value);
        },
        get: function() { return this._.root; }
    });
    Object.defineProperty($this, "octave", {
        set: function(value) {
            if (typeof value === "number") {
                this._.octave = value;
            }
        },
        get: function() { return this._.octave; }
    });
    
    var initialize = function(_args) {
        var i, _;
        
        this._ = _ = {};
        
        i = 0;
        if (typeof _args[i] === "string" &&
            Scale.Scales[_args[i]] !== undefined) {
            _.scale = _args[i++];
        } else {
            _.scale = "major";
        }
        _.list = Scale.Scales[_.scale];
        if (typeof _args[i] !== "undefined") {
            this.root = _args[i++];
        } else {
            this.root = 440;
        }
        _.octave = typeof _args[i] === "number" ? _args[i++] : 0;
        
        _.scale_value = 0;
        _.prev_value  = undefined;
        _.prev_index  = undefined;
        _.prev_octave = undefined;
        
        this.args = timbre.fn.valist.call(this, _args.slice(i));
    };
    
    $this.clone = function(deep) {
        var newone, _ = this._;
        newone = timbre("scale");
        newone.scale  = _.scale;
        newone._.root = _.root;
        newone._.octave = _.octave;
        return timbre.fn.copyBaseArguments(this, newone, deep);
    };
    
    $this.seq = function(seq_id) {
        var _ = this._;
        var cell, args, root, value;
        var index, delta, x0, x1;
        var scale_value, octave;
        var len, x, tmp, i, imax;
        
        if (!_.ison) return timbre._.none;
        
        cell = this.cell;
        if (seq_id !== this.seq_id) {
            this.seq_id = seq_id;
            args = this.args.slice(0);
            tmp  = 0;
            for (i = 0, imax = args.length; i < imax; ++i) {
                tmp += args[i].seq(seq_id)[0];
            }
            value = tmp;
            if (value !== _.prev_value) {
                len = _.list.length;
                if (value >= 0) {
                    index = value % len;
                    octave = (value / len)|0;
                } else {
                    index = (len + (value % len)) % len;
                    octave = Math.floor(value / len);
                }
                delta  = index - (index|0);
                index |= 0;
                if (delta === 0) {
                    scale_value = _.list[index];
                } else {
                    if (index === _.list.length - 1) {
                        x0 = _.list[index];
                        x1 = _.list[0] + 12;
                        scale_value = (1.0 - delta) * x0 + delta * x1;
                    } else {
                        x0 = _.list[index];
                        x1 = _.list[index+1];
                        scale_value = (1.0 - delta) * x0 + delta * x1;
                    }
                }
                _.scale_value = scale_value;
                _.prev_value  = value;
                _.prev_octave = octave;
            } else {
                scale_value = _.scale_value;
                octave = _.prev_octave;
            }
            octave += _.octave;
            root = _.root.seq(seq_id)[0];
            x = root * Math.pow(2, (scale_value + octave * 12) / 12);
            x = x * _.mul + _.add;
            for (i = cell.length; i--; ) {
                cell[i] = x;
            }
        }
        return cell;
    };
    
    $this.getScale = function(name) {
        return Scale.Scales[name];
    };
    
    $this.setScale = function(name, value) {
        if (value instanceof Array) {
            Scale.Scales[name] = value;
        }
        return this;
    };
    
    return Scale;
}());
timbre.fn.register("scale", Scale);

Scale.Scales = {};
Scale.Scales["major"] = [0, 2, 4, 5, 7, 9, 11];
Scale.Scales["minor"] = [0, 2, 3, 5, 7, 8, 10];
Scale.Scales["ionian"]     = [0, 2, 4, 5, 7, 9, 11];
Scale.Scales["dorian"]     = [0, 2, 3, 5, 7, 9, 10];
Scale.Scales["phrigian"]   = [0, 1, 3, 5, 7, 8, 10];
Scale.Scales["lydian"]     = [0, 2, 4, 6, 7, 9, 11];
Scale.Scales["mixolydian"] = [0, 2, 4, 5, 7, 9, 10];
Scale.Scales["aeolian"]    = [0, 2, 3, 5, 7, 8, 10];
Scale.Scales["locrian"]    = [0, 1, 3, 5, 6, 8, 10];

Scale.Scales["wholetone"] = [0, 2, 4, 6, 8, 10];
Scale.Scales["chromatic"] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

Scale.Scales["ryukyu"] = [0, 4, 5, 7, 11];

timbre.fn.register("major", Scale, function(_args) {
    return new Scale(["major"].concat(_args));
});
timbre.fn.register("minor", Scale, function(_args) {
    return new Scale(["minor"].concat(_args));
});

// __END__

describe("scale", function() {
    object_test(Scale, "scale");
});
