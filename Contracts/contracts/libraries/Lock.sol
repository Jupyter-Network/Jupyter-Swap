pragma solidity ^0.8.13;

abstract contract Lock {
    uint8 private constant _UNLOCKED = 1;
    uint8 private constant _LOCKED = 2;
    uint8 private _status;

    constructor() {
        _status = _UNLOCKED;
    }

    modifier locked() {
        _isLocked();
        _;
        _unlock();
    }

    function _isLocked() private {
        require(_status != _LOCKED, "Reentrancy Lock active");
        _status = _LOCKED;
    }

    function _unlock() private {
        _status = _UNLOCKED;
    }
}
