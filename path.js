exports = module.exports = function (obj, path) {
	var next = obj;

    path = path.split(/[\[\]\.]+/);

    if (path[path.length - 1] === "") {
        path.pop();
    }

    while (path.length && (next = next[path.shift()]) && typeof next === "object" && next !== null);

    return path.length ? undefined : next;
};