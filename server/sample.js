const sampleUsers = [
    /* 1 */
    {   userId: 100001,
        username: "@johnniecruz",
        name: "John Cruz",
        password: "String", //dapat hashed but for now no (TODO BY JOODIE)
        status: "Customer",
        securityQuestions: [1, 2, 3],
        secAns1: "Johnny Jr.",  // First Pet's Name
        secAns2: "Dela",        // Mother's maiden name
        secAns3: "Johnnie",     // Childhood Nickname
        passwordHistory: [],
        lastChanged: "11-01-2025 12:39:01 pm" },

    /* 2 */
    {   userId: 100002,
        username: "Juannn",
        name: "Juan Perez",
        password: "String", //dapat hashed but for now no (TODO BY JOODIE)
        status: "Customer",
        securityQuestions: [2, 3, 4],
        secAns1: "Torrez",      // Mother's maiden name
        secAns2: "The One",     // Childhood Nickname
        secAns3: "International School",     // Name of the first school you attended
        passwordHistory: [],
        lastChanged: "11-01-2025 12:49:01 pm" },

    /* 3 */
    {   userId: 100003,
        username: "Josephbro",
        name: "Joseph Santos",
        password: "String", //dapat hashed but for now no (TODO BY JOODIE)
        status: "Customer",
        securityQuestions: [3, 4, 5],
        secAns1: "Jojo",      // Childhood Nickname
        secAns2: "International School",     // Name of the first school you attended
        secAns3: "Superman",     // Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:08:04 pm" },

    /* 4 */
    {   userId: 100004,
        username: "JuanitaGirlie",
        name: "Juanita Abagnale",
        password: "String", //dapat hashed but for now no (TODO BY JOODIE)
        status: "Customer",
        securityQuestions: [3, 1, 5],
        secAns1: "Gurl",      // Childhood Nickname
        secAns2: "Mao Mao The First Princess",     // First Pet's Name
        secAns3: "Sofia",     // Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:02:04 pm" },

    /* 5 */
    {   userId: 100005,
        username: "Manila Branch",
        name: "Man ila",
        password: "employee", //dapat hashed but for now no (TODO BY JOODIE)
        status: "Employee",
        securityQuestions: [3, 4, 5],
        secAns1: "ESMC",      // Childhood Nickname
        secAns2: "ESMC School",     // Name of the first school you attended
        secAns3: "ESMC",     // Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:10:04 pm" },
];

const sampleOrders = [
    /* 1 */
    {   orderId : "FRI12345",
        senderName : "John Cruz",
        receiverName : "Juan Perez",
        senderNum : 9121231234,
        receiverNum : 9121234567,

        itemDesc : ["Item1", "Item2"],
        itemNum : [1, 1],
        itemPrice : [123, 456],

        transDate : "10-18-2024",
        originBranch : "Manila",
        destBranch : "Romblon",

        initialCharge : 579,
        discount : 123,
        total : 456,

        status : "IN TRANSIT",
        arrivalDate : "10-20-2024",
        updatedBy : "Manila",
        updates: [30002, 30003]
    },

    /* 2 */
    {
        orderId: "FRI98765",
        senderName: "Joseph Santos",
        receiverName: "Juan Perez",
        senderNum: 9124446574,
        receiverNum: 9122222222,

        itemDesc: ["Item11", "Item22"],
        itemNum: [3, 5],
        itemPrice: [300, 100],

        transDate: "10-18-2024",
        originBranch: "Manila",
        destBranch: "Romblon",

        initialCharge : 1400,
        discount : 100,
        total: 1500,

        status: "PROCESSING",
        arrivalDate: "---",
        updatedBy: "---",
        updates: []
    },

    /* 3 */
    {   orderId : "THU11111",
        senderName : "John Cruz",
        receiverName : "Juanita Abagnale",
        senderNum : 9129874567,
        receiverNum : 9123331122,

        itemDesc : ["Item12"],
        itemNum : [5],
        itemPrice : [400],

        transDate : "10-17-2024",
        originBranch : "Magdiwang",
        destBranch : "Manila",

        initialCharge : 2000,
        discount : 100,
        total : 1900,

        status : "PROCESSING",
        arrivalDate : "10-27-2024",
        updatedBy : "Magdiwang",
        updates : [30001] 
    },
];

const sampleUpdates = [
    /* 1 */
    {   updateId : 30001,
        status : "PROCESSING",
        statusDesc : "The order has been received and is being prepared for shipment",
        updateDate : "10-17-2024",
        updateTime : "09:30:00 PM" },


    /* 2 */
    {   updateId : 30002,
        status : "PROCESSING",
        statusDesc : "The order has been received and is being prepared for shipment",
        updateDate : "10-18-2024",
        updateTime : "07:18:39 AM" },    

    /* 3 */
    {   updateId : 30003,
        status : "IN TRANSIT",
        statusDesc : "The package is on its way to the destination",
        updateDate : "10-18-2024",
        updateTime : "12:18:39 PM" },
];

module.exports = { sampleUsers, sampleOrders, sampleUpdates };