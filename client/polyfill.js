// Polyfill for Array.prototype.toReversed
// Required for older Node.js versions (pre-v20) used with newer Expo/Metro versions
if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}
