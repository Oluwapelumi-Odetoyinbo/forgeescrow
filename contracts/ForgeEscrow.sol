// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ForgeEscrow - Milestone-based Freelance Escrow Platform
/// @notice Secure escrow contract for freelance work with milestone-based payments
/// @dev Implements reentrancy protection and comprehensive security checks
contract ForgeEscrow {
    // State variables
    address public owner;
    uint256 public escrowCounter;
    uint256 public platformFeePercent = 2; // 2% platform fee
    uint256 public constant MAX_MILESTONES = 20;
    
    // Reentrancy guard
    uint256 private locked = 1;
    
    // Structs
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool approved;
        uint256 completedAt;
    }
    
    struct Escrow {
        uint256 id;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 depositedAmount;
        uint256 releasedAmount;
        string title;
        string description;
        Milestone[] milestones;
        EscrowStatus status;
        uint256 createdAt;
        uint256 deadline;
        bool disputed;
    }
    
    enum EscrowStatus {
        Created,
        Funded,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }
    
    // Mappings
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public clientEscrows;
    mapping(address => uint256[]) public freelancerEscrows;
    
    // Events
    event EscrowCreated(uint256 indexed escrowId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneIndex);
    event MilestoneApproved(uint256 indexed escrowId, uint256 milestoneIndex, uint256 amount);
    event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId);
    event DisputeRaised(uint256 indexed escrowId, address indexed raiser);
    event DisputeResolved(uint256 indexed escrowId, address indexed resolver);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier nonReentrant() {
        require(locked == 1, "Reentrancy detected");
        locked = 2;
        _;
        locked = 1;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId > 0 && _escrowId <= escrowCounter, "Escrow does not exist");
        _;
    }
    
    modifier onlyClient(uint256 _escrowId) {
        require(escrows[_escrowId].client == msg.sender, "Only client can call this function");
        _;
    }
    
    modifier onlyFreelancer(uint256 _escrowId) {
        require(escrows[_escrowId].freelancer == msg.sender, "Only freelancer can call this function");
        _;
    }
    
    modifier onlyParties(uint256 _escrowId) {
        require(
            escrows[_escrowId].client == msg.sender || escrows[_escrowId].freelancer == msg.sender,
            "Only client or freelancer can call this function"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }
    
    /// @notice Create a new escrow with milestones
    /// @param _freelancer Address of the freelancer
    /// @param _title Title of the project
    /// @param _description Description of the project
    /// @param _milestoneDescriptions Array of milestone descriptions
    /// @param _milestoneAmounts Array of milestone amounts in wei
    /// @param _deadline Unix timestamp for project deadline
    /// @return escrowId The ID of the newly created escrow
    function createEscrow(
        address _freelancer,
        string memory _title,
        string memory _description,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts,
        uint256 _deadline
    ) external returns (uint256) {
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Client and freelancer cannot be the same");
        require(_milestoneDescriptions.length > 0, "At least one milestone required");
        require(_milestoneDescriptions.length == _milestoneAmounts.length, "Milestone arrays length mismatch");
        require(_milestoneDescriptions.length <= MAX_MILESTONES, "Too many milestones");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be greater than 0");
            totalAmount += _milestoneAmounts[i];
        }
        require(totalAmount > 0, "Total amount must be greater than 0");
        
        escrowCounter++;
        uint256 escrowId = escrowCounter;
        
        Escrow storage newEscrow = escrows[escrowId];
        newEscrow.id = escrowId;
        newEscrow.client = msg.sender;
        newEscrow.freelancer = _freelancer;
        newEscrow.totalAmount = totalAmount;
        newEscrow.title = _title;
        newEscrow.description = _description;
        newEscrow.status = EscrowStatus.Created;
        newEscrow.createdAt = block.timestamp;
        newEscrow.deadline = _deadline;
        
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newEscrow.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                completed: false,
                approved: false,
                completedAt: 0
            }));
        }
        
        clientEscrows[msg.sender].push(escrowId);
        freelancerEscrows[_freelancer].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, _freelancer, totalAmount);
        
        return escrowId;
    }
    
    /// @notice Fund an escrow with zkLTC
    /// @param _escrowId The ID of the escrow to fund
    function fundEscrow(uint256 _escrowId) 
        external 
        payable 
        escrowExists(_escrowId) 
        onlyClient(_escrowId) 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Created, "Escrow already funded or cancelled");
        require(msg.value > 0, "Must send funds");
        require(escrow.depositedAmount + msg.value <= escrow.totalAmount, "Exceeds total amount");
        
        escrow.depositedAmount += msg.value;
        
        if (escrow.depositedAmount == escrow.totalAmount) {
            escrow.status = EscrowStatus.Funded;
        }
        
        emit EscrowFunded(_escrowId, msg.value);
    }
    
    /// @notice Mark a milestone as completed by freelancer
    /// @param _escrowId The ID of the escrow
    /// @param _milestoneIndex The index of the milestone to mark as completed
    function completeMilestone(uint256 _escrowId, uint256 _milestoneIndex) 
        external 
        escrowExists(_escrowId) 
        onlyFreelancer(_escrowId) 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.InProgress, "Escrow not active");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(!escrow.milestones[_milestoneIndex].completed, "Milestone already completed");
        require(!escrow.disputed, "Escrow is disputed");
        
        escrow.milestones[_milestoneIndex].completed = true;
        escrow.milestones[_milestoneIndex].completedAt = block.timestamp;
        
        if (escrow.status == EscrowStatus.Funded) {
            escrow.status = EscrowStatus.InProgress;
        }
        
        emit MilestoneCompleted(_escrowId, _milestoneIndex);
    }
    
    /// @notice Approve a completed milestone and release payment
    /// @param _escrowId The ID of the escrow
    /// @param _milestoneIndex The index of the milestone to approve
    function approveMilestone(uint256 _escrowId, uint256 _milestoneIndex) 
        external 
        escrowExists(_escrowId) 
        onlyClient(_escrowId) 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.InProgress, "Escrow not in progress");
        require(_milestoneIndex < escrow.milestones.length, "Invalid milestone index");
        require(escrow.milestones[_milestoneIndex].completed, "Milestone not completed");
        require(!escrow.milestones[_milestoneIndex].approved, "Milestone already approved");
        require(!escrow.disputed, "Escrow is disputed");
        
        Milestone storage milestone = escrow.milestones[_milestoneIndex];
        milestone.approved = true;
        
        uint256 amount = milestone.amount;
        uint256 platformFee = (amount * platformFeePercent) / 100;
        uint256 freelancerPayment = amount - platformFee;
        
        escrow.releasedAmount += amount;
        
        // Check if all milestones are approved
        bool allApproved = true;
        for (uint256 i = 0; i < escrow.milestones.length; i++) {
            if (!escrow.milestones[i].approved) {
                allApproved = false;
                break;
            }
        }
        
        if (allApproved) {
            escrow.status = EscrowStatus.Completed;
        }
        
        // Transfer funds
        (bool successFreelancer, ) = escrow.freelancer.call{value: freelancerPayment}("");
        require(successFreelancer, "Transfer to freelancer failed");
        
        (bool successOwner, ) = owner.call{value: platformFee}("");
        require(successOwner, "Transfer to owner failed");
        
        emit MilestoneApproved(_escrowId, _milestoneIndex, amount);
        emit PaymentReleased(_escrowId, escrow.freelancer, freelancerPayment);
    }
    
    /// @notice Cancel an unfunded escrow
    /// @param _escrowId The ID of the escrow to cancel
    function cancelEscrow(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyClient(_escrowId) 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Created, "Can only cancel unfunded escrow");
        
        escrow.status = EscrowStatus.Cancelled;
        
        // Refund any deposited amount
        if (escrow.depositedAmount > 0) {
            uint256 refundAmount = escrow.depositedAmount;
            escrow.depositedAmount = 0;
            
            (bool success, ) = escrow.client.call{value: refundAmount}("");
            require(success, "Refund failed");
        }
        
        emit EscrowCancelled(_escrowId);
    }
    
    /// @notice Raise a dispute
    /// @param _escrowId The ID of the escrow
    function raiseDispute(uint256 _escrowId) 
        external 
        escrowExists(_escrowId) 
        onlyParties(_escrowId) 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(
            escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.InProgress,
            "Cannot dispute in current state"
        );
        require(!escrow.disputed, "Dispute already raised");
        
        escrow.disputed = true;
        escrow.status = EscrowStatus.Disputed;
        
        emit DisputeRaised(_escrowId, msg.sender);
    }
    
    /// @notice Resolve a dispute (owner only)
    /// @param _escrowId The ID of the escrow
    /// @param _clientRefundPercent Percentage to refund to client (0-100)
    function resolveDispute(uint256 _escrowId, uint256 _clientRefundPercent) 
        external 
        escrowExists(_escrowId) 
        onlyOwner 
        nonReentrant 
    {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(_clientRefundPercent <= 100, "Invalid refund percentage");
        
        uint256 remainingAmount = escrow.depositedAmount - escrow.releasedAmount;
        require(remainingAmount > 0, "No funds to distribute");
        
        uint256 clientRefund = (remainingAmount * _clientRefundPercent) / 100;
        uint256 freelancerPayment = remainingAmount - clientRefund;
        
        escrow.disputed = false;
        escrow.status = EscrowStatus.Completed;
        escrow.releasedAmount = escrow.depositedAmount;
        
        if (clientRefund > 0) {
            (bool successClient, ) = escrow.client.call{value: clientRefund}("");
            require(successClient, "Refund to client failed");
        }
        
        if (freelancerPayment > 0) {
            (bool successFreelancer, ) = escrow.freelancer.call{value: freelancerPayment}("");
            require(successFreelancer, "Payment to freelancer failed");
        }
        
        emit DisputeResolved(_escrowId, msg.sender);
    }
    
    /// @notice Update platform fee percentage
    /// @param _newFeePercent New fee percentage (0-10)
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 10, "Fee cannot exceed 10%");
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(_newFeePercent);
    }
    
    /// @notice Transfer ownership
    /// @param _newOwner Address of the new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(oldOwner, _newOwner);
    }
    
    /// @notice Get escrow details
    /// @param _escrowId The ID of the escrow
    function getEscrow(uint256 _escrowId) 
        external 
        view 
        escrowExists(_escrowId) 
        returns (
            uint256 id,
            address client,
            address freelancer,
            uint256 totalAmount,
            uint256 depositedAmount,
            uint256 releasedAmount,
            string memory title,
            string memory description,
            EscrowStatus status,
            uint256 createdAt,
            uint256 deadline,
            bool disputed
        ) 
    {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.id,
            escrow.client,
            escrow.freelancer,
            escrow.totalAmount,
            escrow.depositedAmount,
            escrow.releasedAmount,
            escrow.title,
            escrow.description,
            escrow.status,
            escrow.createdAt,
            escrow.deadline,
            escrow.disputed
        );
    }
    
    /// @notice Get milestone details
    /// @param _escrowId The ID of the escrow
    /// @param _milestoneIndex The index of the milestone
    function getMilestone(uint256 _escrowId, uint256 _milestoneIndex) 
        external 
        view 
        escrowExists(_escrowId) 
        returns (
            string memory description,
            uint256 amount,
            bool completed,
            bool approved,
            uint256 completedAt
        ) 
    {
        require(_milestoneIndex < escrows[_escrowId].milestones.length, "Invalid milestone index");
        Milestone storage milestone = escrows[_escrowId].milestones[_milestoneIndex];
        return (
            milestone.description,
            milestone.amount,
            milestone.completed,
            milestone.approved,
            milestone.completedAt
        );
    }
    
    /// @notice Get number of milestones for an escrow
    /// @param _escrowId The ID of the escrow
    /// @return Number of milestones
    function getMilestoneCount(uint256 _escrowId) 
        external 
        view 
        escrowExists(_escrowId) 
        returns (uint256) 
    {
        return escrows[_escrowId].milestones.length;
    }
    
    /// @notice Get client's escrow IDs
    /// @param _client Address of the client
    /// @return Array of escrow IDs
    function getClientEscrows(address _client) external view returns (uint256[] memory) {
        return clientEscrows[_client];
    }
    
    /// @notice Get freelancer's escrow IDs
    /// @param _freelancer Address of the freelancer
    /// @return Array of escrow IDs
    function getFreelancerEscrows(address _freelancer) external view returns (uint256[] memory) {
        return freelancerEscrows[_freelancer];
    }
    
    /// @notice Get contract balance
    /// @return Contract balance in wei
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
