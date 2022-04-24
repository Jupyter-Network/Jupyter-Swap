
// File: @openzeppelin/contracts/utils/Address.sol


// OpenZeppelin Contracts (last updated v4.5.0) (utils/Address.sol)

pragma solidity ^0.8.1;

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(isContract(target), "Address: delegate call to non-contract");

        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Tool to verifies that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.0;



/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using Address for address;

    function safeTransfer(
        IERC20 token,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        require(
            (value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        uint256 newAllowance = token.allowance(address(this), spender) + value;
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(
        IERC20 token,
        address spender,
        uint256 value
    ) internal {
        unchecked {
            uint256 oldAllowance = token.allowance(address(this), spender);
            require(oldAllowance >= value, "SafeERC20: decreased allowance below zero");
            uint256 newAllowance = oldAllowance - value;
            _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) {
            // Return data is optional
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

// File: @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol


// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity ^0.8.0;


/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}

// File: @openzeppelin/contracts/token/ERC20/ERC20.sol


// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * The default value of {decimals} is 18. To select a different value for
     * {decimals} you should overload it.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless this function is
     * overridden;
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, _allowances[owner][spender] + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = _allowances[owner][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `sender` to `recipient`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Spend `amount` form the allowance of `owner` toward `spender`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}
}

// File: Swap.sol



pragma solidity ^0.8.7;



abstract contract SwapToken {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor() {
        totalSupply = 0;
    }

    function mint(uint256 amount, address user) internal {
        totalSupply += amount;
        balanceOf[user] += amount;
    }

    function burn(uint256 amount, address user) internal {
        totalSupply -= amount;
        balanceOf[user] -= amount;
    }
}

//-------------------------------------------------------------------------------------
abstract contract SwapScale {
    uint64 internal constant _scaleFactor = 1 ether;
    uint32 internal constant _minAmount = 10**5;
    uint64 internal constant _percentFee = 3 ether / 1000; //0.3%
    uint64 internal constant _protocolFee = 3 ether / 10000; //0.03%

    function _scaleUp(uint256 value) internal pure returns (uint256) {
        return value * _scaleFactor;
    }

    function _scaleDown(uint256 value) internal pure returns (uint256) {
        return value / _scaleFactor;
    }
}

//-------------------------------------------------------------------------------------
contract Swap is SwapScale, SwapToken {
    using SafeERC20 for IERC20;
    address Router;
    modifier minValue(uint256 _amount) {
        require(_amount > _minAmount, "amount lower than min. amount!");
        _;
    }

    modifier calledByRouter() {
        require(msg.sender == Router, "Denied can only be accessed by router");
        _;
    }

    uint256 public token0Balance;
    uint256 public token1Balance;

    address protocolAddress;

    bool private initialDepositDone = false;

    IERC20 public token0;
    IERC20 public token1;

    constructor(
        address _token0,
        address _token1,
        address _protocolAddress
    ) {
        Router = msg.sender;
        require(
            _token0 != address(0) &&
                _token1 != address(0) &&
                _protocolAddress != address(0),
            "Zero address not allowed"
        );
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        protocolAddress = _protocolAddress;
    }

    function initialDeposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external calledByRouter minValue(_token0Amount) minValue(_token1Amount) {
        //Checks
        require(!initialDepositDone, "already done use deposit()");
        //Effects
        mint(_token0Amount * _token1Amount, from);
        initialDepositDone = true;
        //Interactions
        _rcvTokens(token0, _token0Amount, from);
        _rcvTokens(token1, _token1Amount, from);
    }

    //---Deposit and withdraw
    function deposit(
        uint256 _token0Amount,
        uint256 _token1Amount,
        address from
    ) external calledByRouter minValue(_token0Amount) minValue(_token1Amount) {
        //Checks
        require(
            _token1Amount == _scaleUp(_token0Amount) / rate(),
            "Wrong amount of tokens sent"
        );
        //Effects
        mint((totalSupply * _token0Amount) / token1Balance, from);
        //Interactions
        _rcvTokens(token1, _scaleUp(_token0Amount) / rate(), from);
        _rcvTokens(token0, _token0Amount, from);
    }

    function withdraw(address from) external calledByRouter {
        //Check
        uint256 userTokenBalance = balanceOf[from];
        require(userTokenBalance > 0, "Nothing to withdraw");
        //Effects
        (uint256 token0Withdrawal ,uint256 token1Withdrawal) = getBalances(from);

        burn(userTokenBalance, from);
        token0Balance -= token0Withdrawal;
        token1Balance -= token1Withdrawal;

        //Interactions
        token0.safeTransfer(from, token0Withdrawal);
        token1.safeTransfer(from, token1Withdrawal);

    }

    //---Trade
    function swapToken0ToToken1(
        uint256 _token0Amount,
        uint256 _token1AmountMin,
        address from
    ) external calledByRouter minValue(_token0Amount) {
        //Checks
        uint256 token1Withdrawal = getToken1AmountFromToken0Amount(
            _token0Amount
        );
        require(token1Withdrawal >= _token1AmountMin, "Price changed");

        //Effects
        token1Balance -= token1Withdrawal;
        _sendProtocolFeeToken1(token1Withdrawal);

        //Interactions
        _rcvTokens(token0, _token0Amount, from);
        token1.safeTransfer(from, token1Withdrawal);
    }

    function swapToken1ToToken0(
        uint256 _token1Amount,
        uint256 _token0AmountMin,
        address from
    ) external calledByRouter minValue(_token1Amount) {
        //Checks
        uint256 tokenWithdrawal = getToken0AmountFromToken1Amount(
            _token1Amount
        );
        require(tokenWithdrawal >= _token0AmountMin, "Price changed");

        //Effects
        token0Balance -= tokenWithdrawal;
        _sendProtocolFeeToken0(tokenWithdrawal);

        //Interactions
        _rcvTokens(token1, _token1Amount, from);
        token0.safeTransfer(from, tokenWithdrawal);
    }

    function getToken1AmountFromToken0Amount(uint256 tokenAmount)
        public
        view
        calledByRouter
        returns (uint256)
    {
        return _subtractFee((tokenAmount * token1Balance) / (token0Balance + tokenAmount));
    }

    function getToken0AmountFromToken1Amount(uint256 tokenAmount)
        public
        view
        calledByRouter
        returns (uint256)
    {
        return _subtractFee((tokenAmount * token0Balance) / (token1Balance + tokenAmount));

    }

    //---helper
    function _rcvTokens(
        IERC20 token,
        uint256 amount,
        address from
    ) private {
        //Checks
        require(token.balanceOf(from) >= amount, "Your balance is too too low");
        require(_minAmount <= amount, "Sent amount too low");
        //Effects
        if (address(token) == address(token0)) {
            token0Balance += amount;
        } else if (address(token) == address(token1)) {
            token1Balance += amount;
        }
    }

    function rate() public view calledByRouter returns (uint256) {
        return _scaleUp(token0Balance) / token1Balance;
    }

    function _subtractFee(uint256 value) private pure returns (uint256) {
        return (value * (_scaleFactor - _percentFee)) / _scaleFactor;
    }

    function _sendProtocolFeeToken0(uint256 value) private {
      uint256 amount = _scaleDown(value * _protocolFee);
        mint((totalSupply / (2 * token1Balance)) * amount,protocolAddress);
    }

    function _sendProtocolFeeToken1(uint256 value) private {
        uint256 amount = _scaleDown(value * _protocolFee);
        mint((totalSupply / (2 * token0Balance)) * amount,protocolAddress);
    }

    function getBalances(address from)
        public
        view
        calledByRouter
        returns (uint256, uint256)
    {
        uint256 userTokenBalance = balanceOf[from];
        uint256 partOfPool = totalSupply / userTokenBalance;
        uint256 token0Withdrawal = token0Balance / partOfPool;
        uint256 token1Withdrawal = token1Balance / partOfPool;
        return (token0Withdrawal, token1Withdrawal);
    }
}


// File: Router.sol


pragma solidity^0.8.7;
//import "./Token.sol";

//import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IRouter {
    function createLiquidityPool(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external ;

    function addLiquidity(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external;

    function removeLiquidity(address _token0Address, address _token1Address)
        external;

    function swapToken0ToToken1(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1AmountMin
    ) external;

    function swapToken1ToToken0(
        address _token0Address,
        address _token1Address,
        uint256 _token1Amount,
        uint256 _token0AmountMin
    ) external;

    function getToken1AmountFromToken0Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getToken0AmountFromToken1Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external view returns (uint256);

    function getDepositAmount(
        address _token0Address,
        address _token1Address,
        uint256 _amount
    ) external view returns (uint256);

    function getSwapTokenTotalSupply(
        address _token0Address,
        address _token1Address
    ) external view returns (uint256);
}

contract Router is IRouter {
    using SafeERC20 for IERC20;
    modifier existingPair(address token0Address, address token1Address) {
        require(
            address(pairs[token0Address][token1Address]) != address(0),
            "Pair doesnt exist"
        );
        _;
    }

    event newPair(address token0Amount, address token1Amount);
    event liquidityIncreased(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );
    event liquidityRemoved(
        address pool,
        uint256 token0Amount,
        uint256 token1Amount
    );

    event rateChanged(address pool, uint256 rate);

    mapping(address => mapping(address => Swap)) public pairs;
    address protocolAddress;

    constructor(address _protocolAddress) {
        require(_protocolAddress != address(0),"Zero address not allowed");
        protocolAddress = _protocolAddress;
    }

    function createLiquidityPool(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external override{
        require(
            address(pairs[_token0Address][_token1Address]) == address(0),
            "Pair exists"
        );
        (address token0, address token1) = _token0Address < _token1Address
            ? (_token0Address, _token1Address)
            : (_token1Address, _token0Address);

        Swap newSwap = new Swap(token0, token1, protocolAddress);
        pairs[_token0Address][_token1Address] = newSwap;
        pairs[_token1Address][_token0Address] = newSwap;

        newSwap.initialDeposit(_token0Amount, _token1Amount, msg.sender);

        IERC20(_token0Address).safeTransferFrom(
            msg.sender,
            address(newSwap),
            _token0Amount
        );
        IERC20(_token1Address).safeTransferFrom(
            msg.sender,
            address(newSwap),
            _token0Amount
        );

        emit newPair(_token0Address, _token1Address);
    }

    function addLiquidity(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1Amount
    ) external override{
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        pair.deposit(_token0Amount, _token1Amount, msg.sender);
        IERC20(pair.token0()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token0Amount
        );
        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit liquidityIncreased(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }

    function removeLiquidity(address _token0Address, address _token1Address)
        external override
        existingPair(_token0Address, _token1Address)
    {
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        pair.withdraw(msg.sender);

        emit liquidityRemoved(
            address(pair),
            pair.token0Balance(),
            pair.token1Balance()
        );
    }

    function swapToken0ToToken1(
        address _token0Address,
        address _token1Address,
        uint256 _token0Amount,
        uint256 _token1AmountMin
    ) external override{
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        pair.swapToken0ToToken1(_token0Amount, _token1AmountMin, msg.sender);

        IERC20(pair.token0()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token0Amount
        );

        emit rateChanged(address(pair), pair.rate());
    }

    function swapToken1ToToken0(
        address _token0Address,
        address _token1Address,
        uint256 _token1Amount,
        uint256 _token0AmountMin
    ) external override{
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        pair.swapToken1ToToken0(_token1Amount, _token0AmountMin, msg.sender);

        IERC20(pair.token1()).safeTransferFrom(
            msg.sender,
            address(pair),
            _token1Amount
        );

        emit rateChanged(address(pair), pair.rate());
    }

    function getToken1AmountFromToken0Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external override view returns (uint256) {
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        return pair.getToken1AmountFromToken0Amount(amount);
    }

    function getToken0AmountFromToken1Amount(
        address _token0Address,
        address _token1Address,
        uint256 amount
    ) external override view returns (uint256) {
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        return pair.getToken0AmountFromToken1Amount(amount);
    }

    function getRate(address token0Address, address token1Address)
        external
        view
        existingPair(token0Address, token1Address)
        returns (uint256)
    {
        return pairs[token0Address][token1Address].rate();
    }

    function getBalance(address token0Address, address token1Address)
        external
        view
        existingPair(token0Address, token1Address)
        returns (uint256)
    {
        return pairs[token0Address][token1Address].balanceOf(msg.sender);
    }

    function _orderInputAddress(address _token0Address, address _token1Address)
        internal
        view
        returns (Swap)
    {
        (address token0, address token1) = _token0Address < _token1Address
            ? (_token0Address, _token1Address)
            : (_token1Address, _token0Address);
        require(
            address(pairs[token0][token1]) != address(0),
            "Pair does not exist"
        );
        return pairs[token0][token1];
    }

    function getDepositAmount(
        address _token0Address,
        address _token1Address,
        uint256 _amount
    ) external override view returns (uint256) {
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        return (_amount * 10**9) / pair.rate();
    }

    function getSwapTokenTotalSupply(
        address _token0Address,
        address _token1Address
    ) external override view returns (uint256) {
        Swap pair = _orderInputAddress(_token0Address, _token1Address);

        return pair.totalSupply();
    }

    //function getPoolBalances(address _token0Address, address _token1Address)
    //    external
    //    view
    //    returns (uint256, uint256)
    //{
    //    Swap pair = _orderInputAddress(_token0Address, _token1Address);
    //    return pair.getBalances(msg.sender);
    //}

    function getPoolBalances(address _token0Address, address _token1Address)
        external
        view
        returns (uint256, uint256)
    {   
        Swap pair = _orderInputAddress(_token0Address, _token1Address);
        return  (ERC20(_token0Address).balanceOf(address(pair)),ERC20(_token1Address).balanceOf(address(pair)));
    }
   
    function tokenBalances(address _token0Address, address _token1Address)
        external
        view
        returns (uint256, uint256)
    {   
        return  (ERC20(_token0Address).balanceOf(msg.sender),ERC20(_token1Address).balanceOf(msg.sender));
    }
    
}
