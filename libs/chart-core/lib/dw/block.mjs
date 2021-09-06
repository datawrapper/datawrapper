const __blocks = {};

function block(id) {
    return __blocks[id];
}

block.register = function(id, lib) {
    __blocks[id] = lib;
};

block.has = function(id) {
    return __blocks[id] !== undefined;
};

export default block;
