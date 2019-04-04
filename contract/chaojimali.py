"""
Name: chaojimali
Admin: AHBSnEnABx9kTWHDmTZ6CDxekfVUpCmHR7
"""
VERSION = 1

OntCversion = '2.0.0'
from ontology.interop.Ontology.Contract import Migrate
from ontology.interop.System.Storage import GetContext, Get, Put, Delete
from ontology.interop.System.Runtime import CheckWitness, GetTime, Notify
from ontology.interop.System.ExecutionEngine import GetExecutingScriptHash, GetScriptContainer
from ontology.interop.Ontology.Native import Invoke
from ontology.interop.Ontology.Runtime import GetCurrentBlockHash, Base58ToAddress
from ontology.builtins import concat, state, sha256
from ontology.interop.System.App import DynamicAppCall

# ONGAddress = Base58ToAddress("HJZMfRvhUbG69tfLZeCzoyf9L9rdeVmsAF") # service execute error!: wrong encoded address
ONGAddress = Base58ToAddress("AFmseVrdL9f9oyCzZefL9tG6UbvhfRZMHJ") # Get contract code from db fail
# bytearray(b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02') # Get contract code from db fail
# ONGAddress = bytearray(b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02')

MyAddress = GetExecutingScriptHash()

ONGMagnitude = 1000000000
OEP4TokenMagnitude = 100000000
Fee = 1000000

DaySeconds = 86400

Admin = Base58ToAddress('AHBSnEnABx9kTWHDmTZ6CDxekfVUpCmHR7')
OEP4_CONTRACT_HASH_KEY = "Key1"
PLAYER_LAST_CHECK_IN_DAY = "Key2"

def Main(operation, args):
    if operation == "setOEP4ContractHash":
        assert (len(args) == 1)
        reversedContractHash = args[0]
        return setOEP4ContractHash(reversedContractHash)

    if operation == "getName":
        assert (len(args) == 0)
        return getName()

    if operation == "getTokenName":
        assert (len(args) == 0)
        return getTokenName()

    if operation == "checkIn":
        assert (len(args) == 1)
        account = args[0]
        return checkIn(account)

    if operation == "canCheckIn":
        assert (len(args) == 1)
        account = args[0]
        return canCheckIn(account)

    if operation == "withdrawONG":
        assert (len(args) == 2)
        account = args[0]
        amount = args[1]
        return withdrawONG(account, amount)

    if operation == "withdrawToken":
        assert (len(args) == 2)
        account = args[0]
        amount = args[1]
        return withdrawToken(account, amount)

    return False

def getName():
    return "chaojimali"

def setOEP4ContractHash(reversedContractHash): #, token):
    assert (CheckWitness(Admin))
    Put(GetContext(), OEP4_CONTRACT_HASH_KEY, reversedContractHash)
    # _chargeToken(_getTokenAddress(), Admin, token)
    Notify([reversedContractHash])
    return True

def _getTokenAddress():
    return Get(GetContext(), OEP4_CONTRACT_HASH_KEY)

def getTokenName():
    tokenAddress = _getTokenAddress()
    res = DynamicAppCall(tokenAddress, "name", [])
    return res

def _transferTokenTo(account, amount):
    res = DynamicAppCall(_getTokenAddress(), "transfer", [MyAddress, account, amount])
    assert (res)

def _chargeToken(account, amount):
    res = DynamicAppCall(_getTokenAddress(), "transfer", [account, MyAddress, amount])
    assert (res)

def _transferONGTo(account, amount):
    param = state(MyAddress, account, amount)
    res = Invoke(0, ONGAddress, "transfer", [param])
    assert (res)

def _chargeONG(account, amount):
    param = state(account, MyAddress, amount)
    res = Invoke(0, ONGAddress, "transfer", [param])
    assert (res)

def checkIn(account):
    assert (CheckWitness(account))
    checkInDays = canCheckIn(account)
    if (checkInDays > 0):
        _transferTokenTo(account, 100 * OEP4TokenMagnitude)
        _chargeONG(account, Fee)
        Put(GetContext(), concatKey(PLAYER_LAST_CHECK_IN_DAY, account), checkInDays)
        Notify(["checkIn", account])
    return True

def withdrawONG(account, amount):
    assert (CheckWitness(Admin))
    _transferONGTo(account, amount)
    Notify(["WithdrawONG", account])

def withdrawToken(account, amount):
    assert (CheckWitness(Admin))
    _transferTokenTo(account, amount)
    Notify(["WithdrawToken", account])

def canCheckIn(account):
    """
    :param account:
    :return: return == 0 => can NOT check in.
              return > 0 => can check in.
    """
    lastTimeCheckIn = Get(GetContext(), concatKey(PLAYER_LAST_CHECK_IN_DAY, account))
    if not lastTimeCheckIn:
        return Div(GetTime(), DaySeconds)
    now = GetTime()
    days = Div(now, DaySeconds)
    if days > lastTimeCheckIn:
        return days
    else:
        return 0


def concatKey(str1,str2):
    """
    connect str1 and str2 together as a key
    :param str1: string1
    :param str2:  string2
    :return: string1_string2
    """
    return concat(concat(str1, '_'), str2)

"""
https://github.com/ONT-Avocados/python-template/blob/master/libs/SafeMath.py
"""

def Add(a, b):
    """
    Adds two numbers, throws on overflow.
    """
    c = a + b
    assert (c >= a)
    return c

def Sub(a, b):
    """
    Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    :param a: operand a
    :param b: operand b
    :return: a - b if a - b > 0 or revert the transaction.
    """
    assert (a>=b)
    return a-b

def Mul(a, b):
    """
    Multiplies two numbers, throws on overflow.
    :param a: operand a
    :param b: operand b
    :return: a - b if a - b > 0 or revert the transaction.
    """
    if a == 0:
        return 0
    c = a * b
    assert (c / a == b)
    return c

def Div(a, b):
    """
    Integer division of two numbers, truncating the quotient.
    """
    assert (b > 0)
    c = a / b
    return c

def Pwr(a, b):
    """
    a to the power of b
    :param a the base
    :param b the power value
    :return a^b
    """
    c = 0
    if a == 0:
        c = 0
    elif b == 0:
        c = 1
    else:
        i = 0
        c = 1
        while i < b:
            c = Mul(c, a)
            i = i + 1
    return c

def Sqrt(a):
    """
    Return sqrt of a
    :param a:
    :return: sqrt(a)
    """
    c = Div(Add(a, 1), 2)
    b = a
    while(c < b):
        b = c
        c = Div(Add(Div(a, c), c), 2)
    return c
