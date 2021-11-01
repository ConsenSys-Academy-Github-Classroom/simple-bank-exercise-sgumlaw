/*

The public version of the file used for testing can be found here: https://gist.github.com/ConsenSys-Academy/ce47850a8e2cba6ef366625b665c7fba

This test file has been updated for Truffle version 5.0. If your tests are failing, make sure that you are
using Truffle version 5.0. You can check this by running "trufffle version"  in the terminal. If version 5 is not
installed, you can uninstall the existing version with `npm uninstall -g truffle` and install the latest version (5.0)
with `npm install -g truffle`.

*/
const { catchRevert } = require("./exceptionsHelpers.js");
var SimpleBank = artifacts.require("./SimpleBank.sol");

contract("SimpleBank", function (accounts) {
  //console.log("Accounts Before", accounts);
  const [contractOwner, alice] = accounts;
  const deposit = web3.utils.toBN(2);
  //console.log("Deposit", web3.utils.toWei(deposit, "Wei").toString());
  //console.log("Accounts After", accounts);
  //console.log("Alice", alice);
  //console.log("contractOwner", contractOwner);

  beforeEach(async () => {
    instance = await SimpleBank.new();
    //balance = await web3.utils.fromWei(instance.getBalance.call());
    
    //console.log("Message Sender Balance: ", balance)
  });

  it("ready to be solved!", async() => {
    const eth100 = 100e18;
    assert.equal(await web3.eth.getBalance(alice), eth100.toString());
  });

  it("is owned by owner", async () => {
    assert.equal(
      // Hint:
      //   the error `TypeError: Cannot read property 'call' of undefined`
      //   will be fixed by setting the correct visibility specifier. See
      //   the following two links
      //   1: https://docs.soliditylang.org/en/v0.8.5/cheatsheet.html?highlight=visibility#function-visibility-specifiers
      //   2: https://docs.soliditylang.org/en/v0.8.5/contracts.html#getter-functions
      await instance.owner.call(),
      contractOwner,
      "owner is not correct",
    );
  });

  it("should mark addresses as enrolled", async () => {
    await instance.enroll({ from: alice });

    const aliceEnrolled = await instance.enrolled(alice, { from: alice });
    assert.equal(
      aliceEnrolled,
      true,
      "enroll balance is incorrect, check balance method or constructor",
    );
  });

  it("should not mark unenrolled users as enrolled", async () => {
    const ownerEnrolled = await instance.enrolled(contractOwner, { from: contractOwner });
    assert.equal(
      ownerEnrolled,
      false,
      "only enrolled users should be marked enrolled",
    );
  });

  it("should deposit correct amount", async () => {
    //const bbalance = await instance.getBalance.call({ from: alice });
    //const bbalance2 = await instance.getBalance.call({ from: contractOwner });
    //console.log("Alice Before Balance:", web3.utils.toWei(bbalance, "Wei").toString());
    //console.log("Contract Owner Before Balance:", web3.utils.toWei(bbalance2, "Wei").toString());
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    //console.log("Alice:", alice);
    const balance = await instance.getBalance.call({ from: alice });
    //const balance2 = await instance.getBalance.call({ from: contractOwner });
    //console.log("Alice Balance:", balance.toString());
    
    //console.log("Alice BN Balance:", web3.utils.toBN(balance).toString());
    //console.log("Contract Owner Balance:", web3.utils.toWei(balance2, "Wei").toString());

    assert.equal(
      deposit.toString(),
      balance.toString(),
      "deposit amount incorrect, check deposit method",
    );
  });

  it("should log a deposit event when a deposit is made", async () => {
    await instance.enroll({ from: alice });
    const result = await instance.deposit({ from: alice, value: deposit });

    const expectedEventResult = { accountAddress: alice, amount: deposit };

    const logAccountAddress = result.logs[0].args.accountAddress;
    const logDepositAmount = result.logs[0].args.amount.toNumber();
    console.log("Log Deposit: ", logDepositAmount)
    assert.equal(
      expectedEventResult.accountAddress,
      logAccountAddress,
      "LogDepositMade event accountAddress property not emitted, check deposit method",
    );

    assert.equal(
      expectedEventResult.amount,
      logDepositAmount,
      "LogDepositMade event amount property not emitted, check deposit method",
    );
  });

  it("should withdraw correct amount", async () => {
    const initialAmount = 0;
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    await instance.withdraw(deposit, { from: alice });
    const balance = await instance.getBalance.call({ from: alice });

    assert.equal(
      balance.toString(),
      initialAmount.toString(),
      "balance incorrect after withdrawal, check withdraw method",
    );
  });

  it("should not be able to withdraw more than has been deposited", async () => {
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    await catchRevert(instance.withdraw(deposit + 1, { from: alice }));
  });

  it("should emit the appropriate event when a withdrawal is made", async () => {
    const initialAmount = 0;
    await instance.enroll({ from: alice });
    await instance.deposit({ from: alice, value: deposit });
    var result = await instance.withdraw(deposit, { from: alice });

    const accountAddress = result.logs[0].args.accountAddress;
    const newBalance = result.logs[0].args.newBalance.toNumber();
    const withdrawAmount = result.logs[0].args.withdrawAmount.toNumber();

    const expectedEventResult = {
      accountAddress: alice,
      newBalance: initialAmount,
      withdrawAmount: deposit,
    };

    assert.equal(
      expectedEventResult.accountAddress,
      accountAddress,
      "LogWithdrawal event accountAddress property not emitted, check deposit method",
    );
    assert.equal(
      expectedEventResult.newBalance,
      newBalance,
      "LogWithdrawal event newBalance property not emitted, check deposit method",
    );
    assert.equal(
      expectedEventResult.withdrawAmount,
      withdrawAmount,
      "LogWithdrawal event withdrawalAmount property not emitted, check deposit method",
    );
  });
});
