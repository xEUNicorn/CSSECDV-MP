const sampleUsers = [
    /* 1 */
    {   userId: 100001,
        username: "@johnniecruz",
        name: "John Cruz",
        password: "$2b$12$VNl.vHGv8kAw8rZELZqmm.IdfcX0OGgbXomjCfygyQB.gy6eOl2Fu", //String
        status: "Customer",
        securityQuestions: ["1", "2", "3"],
        secAns1: "$2a$12$VLz86PY4A2uU/Z2Ka/rJNe13TUnNF7mjWr3ccOQVw4BWh5F62h9N2",     // Johnny Jr. - First Pet's Name
        secAns2: "$2a$12$G9BUqu0xTRnCFahqlhjhxOImK5dekRAtwo1MPGZanROxbsInmfL.C",     // Dela - Mother's maiden name
        secAns3: "$2a$12$2kL.QjmB6E9T8FgLBaFfiehLGoCAm.gokEOWFnvZreJMC1hnZn/vK",     // Johnnie - Childhood Nickname
        passwordHistory: [],
        lastChanged: "11-01-2025 12:39:01 pm" },

    /* 2 */
    {   userId: 100002,
        username: "Juannn",
        name: "Juan Perez",
        password: "$2b$12$VNl.vHGv8kAw8rZELZqmm.IdfcX0OGgbXomjCfygyQB.gy6eOl2Fu", //String
        status: "Customer",
        securityQuestions: ["2", "3", "4"],
        secAns1: "$2a$12$WnMSrE7b1VHlAxEpW7HZgu5irZTik.w1Y5ASA82kQqtjtND1Kc45C",     // Torrez - Mother's maiden name
        secAns2: "$2a$12$QV.AhiLWQx9.4YFjGjGFWOgC67m8hiwt5zan5NPFnTyzdfSExMeNy",     // The One - Childhood Nickname
        secAns3: "$2a$12$/mY4dor6FrS.cY.I1nsd9.Gtr5VCDcJ/gPttQTEozmXzqlhf41dOC",     // International School - Name of the first school you attended
        passwordHistory: [],
        lastChanged: "11-01-2025 12:49:01 pm" },

    /* 3 */
    {   userId: 100003,
        username: "Josephbro",
        name: "Joseph Santos",
        password: "$2b$12$VNl.vHGv8kAw8rZELZqmm.IdfcX0OGgbXomjCfygyQB.gy6eOl2Fu", //String
        status: "Customer",
        securityQuestions: ["3", "4", "5"],
        secAns1: "$2a$12$0z8DEzEk2uEhsnN1FAAmP.uKtPUyZWLUUcSI3031TE9MOUWMvH/O2",     // Jojo - Childhood Nickname
        secAns2: "$2a$12$222iGklD8D3WlGeMYFaCWOJddz7DXluDd9iQPRl7XnxaPdcDsumeS",     // International School - Name of the first school you attended
        secAns3: "$2a$12$eL0wk88U4hzdYBgNK6Yj5elTdFywsIvqKHxvQ37T3XPngfiFtSlzG",     // Superman - Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:08:04 pm" },

    /* 4 */
    {   userId: 100004,
        username: "JuanitaGirlie",
        name: "Juanita Abagnale",
        password: "$2b$12$VNl.vHGv8kAw8rZELZqmm.IdfcX0OGgbXomjCfygyQB.gy6eOl2Fu",
        status: "Customer",
        securityQuestions: ["3", "1", "5"],
        secAns1: "$2a$12$/1ySL6y7.89RcF5cZk0bGurCcEEdI2CiKLzv4gel8/IGUsVim0MJG",     // Gurl - Childhood Nickname
        secAns2: "$2a$12$drF15s0.FRk48KqEh0Q73Omf7s3aukeVHQweImh04xylc6/Ux3wQO",     // Mao Mao The First Princess - First Pet's Name
        secAns3: "$2a$12$V.kv1KExhLTj65hLuWg0SeJ/J2CxC3A/yFwp8PZm/vZlrps6qfyqi",     // Sofia - Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:02:04 pm" },

    /* 5 */
    {   userId: 100005,
        username: "Manila Branch",
        name: "Man ila",
        password: "$2b$12$VNl.vHGv8kAw8rZELZqmm.IdfcX0OGgbXomjCfygyQB.gy6eOl2Fu",
        status: "Employee",
        securityQuestions: ["3", "4", "5"],
        secAns1: "$2a$12$cMdIlv4NWsCFieocaX6HZeGVM4uIP0Mga4XzMe/ILyF6rmCmJowc.",     // ESMC - Childhood Nickname
        secAns2: "$2a$12$XU54Dkc1rImMoIqULQzbAesThsJb2UsWe.amqsXqHHoRjSNN1qV2i",     // ESMC School - Name of the first school you attended
        secAns3: "$2a$12$cMdIlv4NWsCFieocaX6HZeGVM4uIP0Mga4XzMe/ILyF6rmCmJowc.",     // ESMC - Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:10:04 pm" },

    /* 6 */
    {   userId: 100006,
        username: "realtester",
        name: "Real Tester",
        password: "$2b$12$o1g4ALYtWGnBzCTTyys/5uxBxrlEI7FncZ5PAzNd1cVz/Tg6hmmR.", //Sample100!
        status: "Customer",
        securityQuestions: ["1", "3", "5"],
        secAns1: "$2b$12$kU/p.FXg5pidk2rRntF3zeX7tfT91dtYowRebHSN77FEBZS7N6Myi", // Doggie - First Pet's Name
        secAns2: "$2b$12$Z6qbUY/48SUg/xHCVlN7heyUQbA6ke4wo7bleDIh4bOtEEenVOF6u", // EJ - Childhood Nickname
        secAns3: "$2b$12$iFZN1/dWlkUMp4znf6EK5.5K8Pyduts.WsgCoQJ8dYNFZIF6jHZcm", // Me - Favorite fictional character
        passwordHistory: [],
        lastChanged: "11-01-2025 01:10:04 pm" },

    /* 7 - ADMIN OWNER */
    {   userId: 100007,
        username: "admin",
        name: "Admin Owner",
        password: "$2b$12$pFq1ESnL5cQ3cudaVFWc8uceRNjlZxa/0KoyrBglGh9T1Fqn7SGhC", //Admin123!
        status: "Owner",
        hubName: "Admin Hub",
        securityQuestions: ["1", "2", "3"],
        secAns1: "$2b$12$kU/p.FXg5pidk2rRntF3zeX7tfT91dtYowRebHSN77FEBZS7N6Myi", // Admin - First Pet's Name
        secAns2: "$2b$12$Z6qbUY/48SUg/xHCVlN7heyUQbA6ke4wo7bleDIh4bOtEEenVOF6u", // Admin - Childhood Nickname
        secAns3: "$2b$12$iFZN1/dWlkUMp4znf6EK5.5K8Pyduts.WsgCoQJ8dYNFZIF6jHZcm", // Admin - Favorite fictional character
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