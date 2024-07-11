const { expect, assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
//1500000000000000000000000

!network.config.chainId == 31337
    ? describe().skip
    : describe("ICO unit tests", () => {
          let deployer,
              ico,
              icoAddress,
              icoUser,
              RT,
              rtAddress,
              ST,
              stAddress,
              owner,
              user,
              tokenBalance
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              owner = (await getNamedAccounts()).owner
              user = (await getNamedAccounts()).user

              await deployments.fixture(["all"])

              ico = await ethers.getContract("Presell", deployer)
              ownerIco = await ethers.getContract("Presell", owner)
              RT = await ethers.getContract("RT", deployer)
              ST = await ethers.getContract("ST", deployer)

              stAddress = await ST.getAddress()
              rtAddress = await RT.getAddress()
              icoAddress = await ico.getAddress()

              tokenBalance = await ST.balanceOf(deployer)
              const tx1 = await ST.transfer(icoAddress, tokenBalance)
              await tx1.wait()
          })

          describe("Buy Token With ETH", () => {
              it("Fails if it is not open", async () => {
                  await network.provider.send("evm_increaseTime", [172800])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await expect(ico.buyTokensWithEther(0)).to.be.revertedWith("Presell: not open")
              })

              it("Fails if amount is not enough", async () => {
                  await expect(ico.buyTokensWithEther(0)).to.be.revertedWith(
                      "Presell: amount must be greater than zero"
                  )
              })

              it("Tansfers correct amount", async () => {
                  const balancee = await ST.balanceOf(icoAddress)
                  const tx = await ico.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await tx.wait()
                  const balance = await ST.balanceOf(icoAddress)
                  assert.equal(balancee - balance, 15e23)
              })

              it("Emits the event", async () => {
                  await expect(ico.buyTokensWithEther(0, { value: BigInt(1e18) })).to.emit(
                      // emits RaffleEnter event if entered to index player(s) address
                      ico,
                      "TokensPurchased"
                  )
              })

              it("Sets the mapping right", async () => {
                  const tx = await ico.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await tx.wait()
                  const amount = await ico.tokensBought(deployer)
                  assert.equal(amount, 1500000)
              })

              it("Sets the gift code mapping right", async () => {
                  const tx = await ico.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await tx.wait()
                  const amount = await ico.giftCodeSales(0)
                  assert.equal(amount, 1500000)
              })

              it("Sets the gift code mapping right", async () => {
                  const tx = await ico.buyTokensWithEther(1, { value: BigInt(1e18) })
                  await tx.wait()
                  const amount = await ico.giftCodeSales(1)
                  assert.equal(amount, 1550000)
              })
          })

          describe("Buy token with USDT", () => {
              it("Fails if it is not open", async () => {
                  await network.provider.send("evm_increaseTime", [172800])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await expect(ico.buyTokensWithUSDT(0, 0)).to.be.revertedWith("Presell: not open")
              })

              it("Fails if amount is not enough", async () => {
                  await expect(ico.buyTokensWithUSDT(0, 0)).to.be.revertedWith(
                      "Presell: amount must be greater than zero"
                  )
              })

              it("Fails if USDT transfer fails", async () => {
                  const user = (await getNamedAccounts()).user
                  icoUser = await ethers.getContract("Presell", user)
                  await expect(icoUser.buyTokensWithUSDT(1000, 0)).to.be.reverted
              })

              it("Tansfers correct amount", async () => {
                  await RT.approve(icoAddress, BigInt(1e19))
                  const tx = await ico.buyTokensWithUSDT(10, 0)
                  await tx.wait(1)
                  const tokensSold = await ico.tokensSold()
                  const balance = await ST.balanceOf(deployer)
                  assert.equal(balance, 1e19)
                  assert.equal(tokensSold, 10)
              })

              it("Sets the gift code mapping right", async () => {
                const tx = await ico.buyTokensWithUSDT(1500000, 1)
                await tx.wait()
                const amount = await ico.giftCodeSales(1)
                assert.equal(amount, 1550000)
            })
          })

          describe("Withdraw owner", () => {
              it("Fails if it's not owner", async () => {
                  await expect(ico.withdrawEther()).to.be.revertedWith(
                      "Presell: caller is not the token owner"
                  )
              })

              it("Reverted if balance is 0", async () => {
                  await expect(ownerIco.withdrawEther()).to.be.revertedWith(
                      "Presell: no Ether to withdraw"
                  )
              })

              it("Transfers amount to owner", async () => {
                  const tx = await ownerIco.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await tx.wait(1)
                  const beforBalance = await ethers.provider.getBalance(owner)
                  const tx2 = await ownerIco.withdrawEther()
                  await tx2.wait(1)
                  const balanceAfter = await ethers.provider.getBalance(owner)
                  expect(balanceAfter > beforBalance)
              })
              it("Emits the event", async () => {
                  await ownerIco.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await expect(ownerIco.withdrawEther()).to.emit(ico, "Withdrawal")
              })
          })

          describe("End ICO", () => {
              it("reverted if it is not owner", async () => {
                  await expect(ico.endICO()).to.be.revertedWith(
                      "Presell: caller is not the token owner"
                  )
              })

              it("reverted if it is open", async () => {
                  await expect(ownerIco.endICO()).to.be.revertedWith(
                      "Presell: Presell is still ongoing"
                  )
              })

              it("takes back remaining tokens", async () => {
                  const beforBalance = await ST.balanceOf(owner)
                  await ownerIco.buyTokensWithEther(0, { value: BigInt(1e18) })
                  await network.provider.send("evm_increaseTime", [172800])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await ownerIco.endICO()
                  const afterBalance = await ST.balanceOf(owner)
                  assert.equal(afterBalance, tokenBalance)
              })
          })

          describe("Changes owner correctly", () => {
              it("Changes owner right", async () => {
                  const tx = await ownerIco.changeOwner(
                      "0xdaa646493D2F7d8fdb111E4366A57728A4e1cAb4"
                  )
                  tx.wait(1)
                  const newOwner = await ownerIco.owner()
                  assert.equal(newOwner, "0xdaa646493D2F7d8fdb111E4366A57728A4e1cAb4")
              })

              it("transfers tokens to owner right", async () => {
                  const startingBalance = await ST.balanceOf(owner)
                  const tx = await ownerIco.withdrawToken(1000000)
                  tx.wait(1)
                  const finalBalance = await ST.balanceOf(owner)
                  assert.equal(finalBalance - startingBalance, BigInt(1000000000000000000000000))
              })
          })
      })
