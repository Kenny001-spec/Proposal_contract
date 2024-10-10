import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ProposalVote Test", function () {
    //Reusable async method for deployment
    async function deployProposalVoteFix() {
      //Contracts are deployed using the first signer/account by default
  
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const ProposalVote = await hre.ethers.getContractFactory("ProposalVote");
      const proposalVote = await ProposalVote.deploy();
  
      return { proposalVote, owner, otherAccount };
    }

    describe("deployment", () => {
        it("Should check if it deployed", async function () {
          const { proposalVote } = await loadFixture(deployProposalVoteFix);

          const proposals = await proposalVote.getAllproposals();
    
          expect(proposals.length).to.equal(0);
        });
    });

        it("Should be able to create a proposal", async function () {
            const { proposalVote } = await loadFixture(deployProposalVoteFix);

            const name = "Proposal 1";
            const description = "Here is a proposal";
            const quorum = 5;

            await expect(proposalVote.createProposal(name, description, quorum)).to.emit(proposalVote, "ProposalCreated").withArgs(name, quorum);
        });


    describe("voteOnProposal", () => {
        it("Should allow voting on a proposal", async function () {
            const { proposalVote, otherAccount } = await loadFixture(deployProposalVoteFix);
    
            const name = "Proposal 1";
            const description = "Here is a proposal";
            const quorum = 5;
            
            await proposalVote.createProposal(name, description, quorum);
            await proposalVote.connect(otherAccount).voteOnProposal(0);
    
         
            const proposal = await proposalVote.getAProposal(0);
            

            expect(proposal.count_).to.equal(1);
            expect(proposal.status_).to.equal(2);
            expect(proposal.voters_).to.include(otherAccount.address);
        });
    });

    it("Should not allow voting twice by the same account", async function () {
        const { proposalVote, otherAccount } = await loadFixture(deployProposalVoteFix);
  
        const name = "Proposal 1";
        const description = "Here is a proposal";
        const quorum = 2;
        await proposalVote.createProposal(name, description, quorum);
  
        await proposalVote.connect(otherAccount).voteOnProposal(0);
  
        // When trying to vote again, it should revert by using the same account
        await expect(proposalVote.connect(otherAccount).voteOnProposal(0)).to.be.revertedWith(
          "You've voted already"
        );


        describe("getAllproposals()", function () {
            it("Should start with an empty array", async function () {
              const { proposalVote } = await loadFixture(deployProposalVoteFix);
              const proposals = await proposalVote.getAllproposals();
              expect(proposals.length).to.equal(0);
            });
          
            it("Should return proposals after creation", async function () {
              const { proposalVote } = await loadFixture(deployProposalVoteFix);
              await proposalVote.createProposal("A", "Description A", 2);
              await proposalVote.createProposal("B", "Description B", 3);
              const proposals = await proposalVote.getAllproposals();
              expect(proposals.length).to.equal(2);
              expect(proposals[0].name).to.equal("A");
              expect(proposals[1].name).to.equal("B");
            });
          });

        describe("getAProposal()", function () {
            it("Should return correct proposal details", async function () {
              const { proposalVote } = await loadFixture(deployProposalVoteFix);
              await proposalVote.createProposal("Proposal 1", "Here is a proposal", 3);
              const proposal = await proposalVote.getAProposal(0);
              
              expect(proposal.name_).to.equal("Proposal 1");
              expect(proposal.desc_).to.equal("Here is a proposal");
              expect(proposal.quorum_).to.equal(3);
              expect(proposal.count_).to.equal(0); 
              expect(proposal.status_).to.equal(1); 
            });
        });
    });

});


