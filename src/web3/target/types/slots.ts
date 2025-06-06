export type Slots = {
  "version": "0.1.0",
  "name": "slots",
  "instructions": [
    {
      "name": "initUserPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initMatchPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "freeDeposit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transferTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "serverCommit",
          "type": "string"
        },
        {
          "name": "playerCommit",
          "type": "string"
        },
        {
          "name": "serverEncodedDeck",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawFromMatchPda",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositMatchPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFromUserPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playerBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "revenueShareWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "u8"
        },
        {
          "name": "instruct",
          "type": "u8"
        },
        {
          "name": "deck",
          "type": {
            "vec": "u16"
          }
        },
        {
          "name": "key",
          "type": "string"
        }
      ]
    },
    {
      "name": "distributeShare",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distributeTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "share",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapToSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programWsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "solMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "jupiterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userWallet",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "server",
            "type": "publicKey"
          },
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deck",
            "type": "bytes"
          },
          {
            "name": "onchainDeck",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "string"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "StartGameEvent",
      "fields": [
        {
          "name": "server",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "matchId",
          "type": "string",
          "index": false
        },
        {
          "name": "serverCommit",
          "type": "string",
          "index": false
        },
        {
          "name": "playerCommit",
          "type": "string",
          "index": false
        },
        {
          "name": "serverEncodedDeck",
          "type": "string",
          "index": false
        },
        {
          "name": "onhcinDeck",
          "type": "bytes",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "GameResultEvent",
      "fields": [
        {
          "name": "amountReceive",
          "type": "u64",
          "index": false
        },
        {
          "name": "eventTaxAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "deck",
          "type": "bytes",
          "index": false
        },
        {
          "name": "key",
          "type": "string",
          "index": false
        },
        {
          "name": "winner",
          "type": {
            "option": "publicKey"
          },
          "index": false
        },
        {
          "name": "isEqual",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "DistributeEvent",
      "fields": [
        {
          "name": "matchId",
          "type": "string",
          "index": false
        },
        {
          "name": "distributeTo",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "share",
          "type": "u8",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFund",
      "msg": "Error InsufficientFund!"
    },
    {
      "code": 6001,
      "name": "InsufficientFundEqualCondition",
      "msg": "Error InsufficientFund In Equal Condition!"
    },
    {
      "code": 6002,
      "name": "RestrictionError",
      "msg": "Restriction error!"
    },
    {
      "code": 6003,
      "name": "InvalidWinnerIndex",
      "msg": "Invalid Winner Index"
    },
    {
      "code": 6004,
      "name": "InvalidDeck",
      "msg": "Invalid Deck"
    },
    {
      "code": 6005,
      "name": "InvalidInstruction",
      "msg": "Invalid Instruction"
    },
    {
      "code": 6006,
      "name": "InvalidDeckIndex",
      "msg": "Invalid Deck Index"
    },
    {
      "code": 6007,
      "name": "PlayerPdaBalanceIsZero",
      "msg": "Player Pda Balance Is Zero!"
    },
    {
      "code": 6008,
      "name": "PdaIsFullWithTaxes",
      "msg": "PDA Is Full With Taxes"
    },
    {
      "code": 6009,
      "name": "PdaAlreadyCleaned",
      "msg": "PDA Has Alread Cleaned"
    },
    {
      "code": 6010,
      "name": "IncorrectOwner",
      "msg": "OWner is incorrect!"
    }
  ]
};

export const IDL: Slots = {
  "version": "0.1.0",
  "name": "slots",
  "instructions": [
    {
      "name": "initUserPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initMatchPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "freeDeposit",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transferTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "serverCommit",
          "type": "string"
        },
        {
          "name": "playerCommit",
          "type": "string"
        },
        {
          "name": "serverEncodedDeck",
          "type": "string"
        }
      ]
    },
    {
      "name": "withdrawFromMatchPda",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "depositMatchPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFromUserPda",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "playerBump",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishGame",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "matchPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "revenueShareWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "u8"
        },
        {
          "name": "instruct",
          "type": "u8"
        },
        {
          "name": "deck",
          "type": {
            "vec": "u16"
          }
        },
        {
          "name": "key",
          "type": "string"
        }
      ]
    },
    {
      "name": "distributeShare",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "distributeTo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "server",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "matchId",
          "type": "string"
        },
        {
          "name": "share",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapToSol",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userPda",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programWsolAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "solMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "jupiterProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "userPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userWallet",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "matchId",
            "type": "string"
          },
          {
            "name": "server",
            "type": "publicKey"
          },
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deck",
            "type": "bytes"
          },
          {
            "name": "onchainDeck",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "string"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "StartGameEvent",
      "fields": [
        {
          "name": "server",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "matchId",
          "type": "string",
          "index": false
        },
        {
          "name": "serverCommit",
          "type": "string",
          "index": false
        },
        {
          "name": "playerCommit",
          "type": "string",
          "index": false
        },
        {
          "name": "serverEncodedDeck",
          "type": "string",
          "index": false
        },
        {
          "name": "onhcinDeck",
          "type": "bytes",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "GameResultEvent",
      "fields": [
        {
          "name": "amountReceive",
          "type": "u64",
          "index": false
        },
        {
          "name": "eventTaxAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "deck",
          "type": "bytes",
          "index": false
        },
        {
          "name": "key",
          "type": "string",
          "index": false
        },
        {
          "name": "winner",
          "type": {
            "option": "publicKey"
          },
          "index": false
        },
        {
          "name": "isEqual",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "DistributeEvent",
      "fields": [
        {
          "name": "matchId",
          "type": "string",
          "index": false
        },
        {
          "name": "distributeTo",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "share",
          "type": "u8",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFund",
      "msg": "Error InsufficientFund!"
    },
    {
      "code": 6001,
      "name": "InsufficientFundEqualCondition",
      "msg": "Error InsufficientFund In Equal Condition!"
    },
    {
      "code": 6002,
      "name": "RestrictionError",
      "msg": "Restriction error!"
    },
    {
      "code": 6003,
      "name": "InvalidWinnerIndex",
      "msg": "Invalid Winner Index"
    },
    {
      "code": 6004,
      "name": "InvalidDeck",
      "msg": "Invalid Deck"
    },
    {
      "code": 6005,
      "name": "InvalidInstruction",
      "msg": "Invalid Instruction"
    },
    {
      "code": 6006,
      "name": "InvalidDeckIndex",
      "msg": "Invalid Deck Index"
    },
    {
      "code": 6007,
      "name": "PlayerPdaBalanceIsZero",
      "msg": "Player Pda Balance Is Zero!"
    },
    {
      "code": 6008,
      "name": "PdaIsFullWithTaxes",
      "msg": "PDA Is Full With Taxes"
    },
    {
      "code": 6009,
      "name": "PdaAlreadyCleaned",
      "msg": "PDA Has Alread Cleaned"
    },
    {
      "code": 6010,
      "name": "IncorrectOwner",
      "msg": "OWner is incorrect!"
    }
  ]
};
