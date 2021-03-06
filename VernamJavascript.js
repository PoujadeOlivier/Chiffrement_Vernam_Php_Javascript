<script type="text/javascript">


//variable à forger à l'authentification, exemple hash(motdepasse + chainealéaoire)
//elle sera créée côté serveur et client, ce sera un secret commun qui sera utilisé comme grain de sel dans chaque masque jetable
sessionStorage.setItem('B2', 'test');






var TAB_ascii = {'A':'000000','B':'000001','C':'000010','D':'000011','E':'000100','F':'000101','G':'000110','H':'000111','I':'001000','J':'001001','K':'001010','L':'001011','M':'001100','N':'001101','O':'001110','P':'001111','Q':'010000','R':'010001','S':'010010','T':'010011','U':'010100','V':'010101','W':'010110','X':'010111','Y':'011000','Z':'011001','a':'011010','b':'011011','c':'011100','d':'011101','e':'011110','f':'011111','g':'100000','h':'100001','i':'100010','j':'100011','k':'100100','l':'100101','m':'100110','n':'100111','o':'101000','p':'101001','q':'101010','r':'101011','s':'101100','t':'101101','u':'101110','v':'101111','w':'110000','x':'110001','y':'110010','z':'110011','0':'110100','1':'110101','2':'110110','3':'110111','4':'111000','5':'111001','6':'111010','7':'111011','8':'111100','9':'111101','+':'111110','/':'111111'};

var TAB_binaire = {};

for (var key in TAB_ascii) {
  TAB_binaire[TAB_ascii[key]] = key;
}


function generateurMicrotime(){
var ms = 'f'+Date.now();
//console.log(ms);
  return ms;
}
/*
//Utilisation
var ms1 = '';
var ms2 = '';
setTimeout(ms1 = generateurMicrotime(),1000);
setTimeout(ms2 = generateurMicrotime(),1000);
console.log(ms1+' '+ms2);
*/


function LettreVersAscii(message,TAB_ascii)
{
    //var msgBin = {};
    var msgBin = [];

    //attention calculer la taille du message après l'encode base64 car chaine plus grande
    message = b64EncodeUnicode(message);
    // fonction Base64 bourre de == à la fin si besoin "padding" mais ne servent à rien et caractère = non dispo dans table binaire base64    
    message = message.split("=").join("");

    var NbreCaract = message.length;
    // L'instruction let permet de déclarer une variable dont la portée est celle du bloc courant
    for(let i=0; i<NbreCaract; i++)
    {
        //crée un objet
        //msgBin[i] = TAB_ascii[message[i]];
        //crée un tableau, nécassaire pour transforamtion en chaine par la suite et interopérablité avec php
        msgBin.push(TAB_ascii[message[i]]);
    }    
    
return msgBin;
}

function AsciiVersLettre(message,TAB_binaire)
{
    var msgAscii = '';
    
    var NbreCaract = Object.keys(message).length;
    //var NbreCaract = msgBin.length;

    for(let i=0; i<NbreCaract; i++)
    {
        msgAscii = msgAscii.concat(TAB_binaire[message[i]]);
    }

    msgAscii = b64DecodeUnicode(msgAscii);

return msgAscii;
}


function fctBinaireXOR(msgBin,cleBin)
{
    //var msgVERNAM = {};
    var msgVERNAM = [];
    
    //var arr = ["a", "b", "c"];
    //arr.length;
    //Object.keys(arr).length;
    //var arr = {"a1":"a", "a2":"b", "a3":"c"};
    //Object.keys(arr).length;
    
    var NbreCaract = Object.keys(msgBin).length;
    //var NbreCaract = msgBin.length;

    for(let i=0; i<NbreCaract; i++)
    {    
        var a = '';
        var b = '';
        var c = '';
        
        var a = msgBin[i];
        var b = cleBin[i];

        for(let j=0; j<6; j++)
        {
            if( (a[j]=='0') && (b[j]=='0') )
            c = c.concat('0');

            if( (a[j]=='1') && (b[j]=='1') )
            c = c.concat('0');
        
            if( (a[j]=='1') && (b[j]=='0') )
            c = c.concat('1');
        
            if( (a[j]=='0') && (b[j]=='1') )
            c = c.concat('1');
    
            //alert( a[j] + '  ' + b[j] + '  ' + c);
        }

        msgVERNAM[i] = c;
    }
return msgVERNAM;
}


function Chainage(entree)
{
    if(Array.isArray(entree))
    {
        entree = entree.join('')
    }
    else
    {
        //str.match(/.{1,n}/g); // Replace n with the size of the substring
        //on est sut 6 bit
        entree = entree.match(/.{1,6}/g);
    }

return entree;
}


function OP1chiffre(msg)
{
    var Un = generateurMicrotime();
    var B2 = sessionStorage.getItem('B2'); //Constante à créer en amont pour complexifier
    var KEYn = HexWhirlpool(B2 + Un);
    
    var msgBin = LettreVersAscii(msg,TAB_ascii);
    var cleBin = LettreVersAscii(KEYn,TAB_ascii);    
    var msgCHIFFRE = fctBinaireXOR(msgBin,cleBin);
    
    msgCHIFFRE = Un+':' + Chainage(msgCHIFFRE);
    /*
    console.log(Un);
    console.log(B2);
    console.log(KEYn);
    console.log(msgBin);
    console.log(cleBin);
    console.log(msgCHIFFRE);
    */
    return msgCHIFFRE;
}


function OP1dechiffre(msgCHIFFRE)
{
    var explode = msgCHIFFRE.split(':');
    var msgCHIFFRE = explode[1];

    var Un = explode[0];
    var B2 = sessionStorage.getItem('B2');
    var KEYn = HexWhirlpool(B2 + Un);
    
    var cleBin = LettreVersAscii(KEYn,TAB_ascii);    
    
    msgCHIFFRE = Chainage(msgCHIFFRE);

    
    msgDECHIFFRE = fctBinaireXOR(msgCHIFFRE,cleBin);    
    
    msgAscii = AsciiVersLettre(msgDECHIFFRE,TAB_binaire);
    
    return msgAscii;
}



function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/*
// depreciate unescape
function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}
*/


//EXEMPLE UTILISATION FONCTIONNEL !!
//OP1

var message = 'PHP : Test code Vernam';
msgchiffre = OP1chiffre(message);
console.log(msgchiffre);
msgdechiffre = OP1dechiffre(msgchiffre);
console.log(msgdechiffre);





/*
var message = 'PHP : Test code Vernam';
var cle = 'Hamp¨lk jOId(-yhd_y86z';
msgBin = LettreVersAscii(message,TAB_ascii);
cleBin = LettreVersAscii(cle,TAB_ascii);

msgCHIFFRE = fctBinaireXOR(msgBin,cleBin);
msgDECHIFFRE = fctBinaireXOR(msgCHIFFRE,cleBin);

msgAscii = AsciiVersLettre(msgDECHIFFRE,TAB_binaire);

//FIN EXEMPLE UTILISATION FONCTIONNEL !!
*/





//______________________________________________
//
//     FUNCTION WHIRPOOL JAVASCRIPT, nécessaire pour faire tourner l'exemple
//______________________________________________






// BEGIN - CHRIS LOMONT'S ONLINE PASSWORD HASHER

/*
 * A JavaScript implementation of the Whirlpool hash function
 * Version 1.0 Copyright (C) Chris Lomont 2006.
 * See www.lomont.org for more info.
 */

// functions from the definition paper, see
// http://paginas.terra.com.br/informatica/paulobarreto/WhirlpoolPage.html

// finite field multiplication
function FieldMult(a, b){ // multiply two field elements in GF(2^8) with poly x^8 + x^4 + x^3 + x^2 + 1
      // finite field 2^8 is from poly x^8 + x^4 + x^3 + x^2 + 1, and then x is primitive
    var poly = 16+8+4+1; // overflow value
    var val = 0;
    while (0 != a){
        if (0 != (a&1))
            val ^= b;
        // divide a by x
        a >>= 1;    
        // multiply b by x
        if (0 != (b&128))
            b = (b<<1)^poly;
        else
            b <<= 1;
    }
    return val&255;
} // FieldMult

// returns m1*m2 as matrices
function MatrixMult(m1, m2){
    var dest = new Array(64); // in case dest is one of the inputs
    // tij = sum m1_ik m2_kj
    for (var i = 0; i <= 7; ++i)
        for (var j = 0; j <= 7; ++j){
            dest[8*i+j] = 0;
            for (var k = 0; k <= 7; ++k)
                dest[8*i+j] ^= FieldMult(m1[8*i+k],m2[8*k+j]);
        }
    return dest;
} // MatrixMult

// the SBox value using the table in the paper
function SBox(val){
    var vals = [
        0x18, 0x23, 0xc6, 0xE8, 0x87, 0xB8, 0x01, 0x4F, 0x36, 0xA6, 0xd2, 0xF5, 0x79, 0x6F, 0x91, 0x52,
        0x60, 0xBc, 0x9B, 0x8E, 0xA3, 0x0c, 0x7B, 0x35, 0x1d, 0xE0, 0xd7, 0xc2, 0x2E, 0x4B, 0xFE, 0x57,
        0x15, 0x77, 0x37, 0xE5, 0x9F, 0xF0, 0x4A, 0xdA, 0x58, 0xc9, 0x29, 0x0A, 0xB1, 0xA0, 0x6B, 0x85,
        0xBd, 0x5d, 0x10, 0xF4, 0xcB, 0x3E, 0x05, 0x67, 0xE4, 0x27, 0x41, 0x8B, 0xA7, 0x7d, 0x95, 0xd8,
        0xFB, 0xEE, 0x7c, 0x66, 0xdd, 0x17, 0x47, 0x9E, 0xcA, 0x2d, 0xBF, 0x07, 0xAd, 0x5A, 0x83, 0x33,
        0x63, 0x02, 0xAA, 0x71, 0xc8, 0x19, 0x49, 0xd9, 0xF2, 0xE3, 0x5B, 0x88, 0x9A, 0x26, 0x32, 0xB0,
        0xE9, 0x0F, 0xd5, 0x80, 0xBE, 0xcd, 0x34, 0x48, 0xFF, 0x7A, 0x90, 0x5F, 0x20, 0x68, 0x1A, 0xAE,
        0xB4, 0x54, 0x93, 0x22, 0x64, 0xF1, 0x73, 0x12, 0x40, 0x08, 0xc3, 0xEc, 0xdB, 0xA1, 0x8d, 0x3d,
        0x97, 0x00, 0xcF, 0x2B, 0x76, 0x82, 0xd6, 0x1B, 0xB5, 0xAF, 0x6A, 0x50, 0x45, 0xF3, 0x30, 0xEF,
        0x3F, 0x55, 0xA2, 0xEA, 0x65, 0xBA, 0x2F, 0xc0, 0xdE, 0x1c, 0xFd, 0x4d, 0x92, 0x75, 0x06, 0x8A,
        0xB2, 0xE6, 0x0E, 0x1F, 0x62, 0xd4, 0xA8, 0x96, 0xF9, 0xc5, 0x25, 0x59, 0x84, 0x72, 0x39, 0x4c,
        0x5E, 0x78, 0x38, 0x8c, 0xd1, 0xA5, 0xE2, 0x61, 0xB3, 0x21, 0x9c, 0x1E, 0x43, 0xc7, 0xFc, 0x04,
        0x51, 0x99, 0x6d, 0x0d, 0xFA, 0xdF, 0x7E, 0x24, 0x3B, 0xAB, 0xcE, 0x11, 0x8F, 0x4E, 0xB7, 0xEB,
        0x3c, 0x81, 0x94, 0xF7, 0xB9, 0x13, 0x2c, 0xd3, 0xE7, 0x6E, 0xc4, 0x03, 0x56, 0x44, 0x7F, 0xA9,
        0x2A, 0xBB, 0xc1, 0x53, 0xdc, 0x0B, 0x9d, 0x6c, 0x31, 0x74, 0xF6, 0x46, 0xAc, 0x89, 0x14, 0xE1,
        0x16, 0x3A, 0x69, 0x09, 0x70, 0xB6, 0xd0, 0xEd, 0xcc, 0x42, 0x98, 0xA4, 0x28, 0x5c, 0xF8, 0x86
        ]; // 256 entries
    return vals[val];
} // SBox

// XOR src into dest bytewise, return dest
function XOR(dest, src){
    for (var pos = 0; pos < 64; ++pos)
        dest[pos] ^= src[pos];
} // XOR

// compute the rho function from the paper
function ApplyRho(value, parameter){ // compute rho[parameter](value)
    
    // apply gamma: applies SBox to each byte in value
    for (var pos = 0; pos < 64; ++pos)
        value[pos] = SBox(value[pos]);

    // apply pi: cyclical permutation b_i,j = a_(i-j)mod 8, j
    var temp = new Array(64);
    for (var i = 0; i < 8; ++i)
        for (var j = 0; j < 8; ++j)
            temp[8*i+j] = value[8*((i-j+8)&7)+j];
    for (var i =0; i < 64; ++i)
        value[i] = temp[i]; // copy back

    // apply theta: linear diffusion
    var C = [ // the constant matrix
        0x01, 0x01, 0x04, 0x01, 0x08, 0x05, 0x02, 0x09,
        0x09, 0x01, 0x01, 0x04, 0x01, 0x08, 0x05, 0x02,
        0x02, 0x09, 0x01, 0x01, 0x04, 0x01, 0x08, 0x05,
        0x05, 0x02, 0x09, 0x01, 0x01, 0x04, 0x01, 0x08,
        0x08, 0x05, 0x02, 0x09, 0x01, 0x01, 0x04, 0x01,
        0x01, 0x08, 0x05, 0x02, 0x09, 0x01, 0x01, 0x04,
        0x04, 0x01, 0x08, 0x05, 0x02, 0x09, 0x01, 0x01,
        0x01, 0x04, 0x01, 0x08, 0x05, 0x02, 0x09, 0x01
        ]; // 64 entries
    value = MatrixMult(value,C);

    // apply sigma[parameter]: key addition
    XOR(value,parameter);
    return value;
} // ApplyRho

// update the round key
function NextKey(key, c, round){ // compute next key and round constant
    // next constant
    for (var j = 0; j <= 7; ++j)
        c[j] = SBox(8*(round-1)+j);

    key = ApplyRho(key,c);
    return key;
} // NextKey

// convert val to hex string
function Hex(val){
    var txt = [
        "0","1","2","3","4","5","6","7",
        "8","9","A","B","C","D","E","F"];
    var temp = "";
    while (0 != val){
        temp = txt[val&15] + temp;
        val >>= 4;
    }
    while (temp.length < 2)
        temp = "0" + temp;
    return temp;
}

// compute W[hash](data) function and store in W
function ComputeW(W, hash, data){
    var key = new Array(64); // round key
    var c   = new Array(64); // round constant
    
    for (var i = 0; i < 64; ++i){
        c[i]   = 0;       // zero out round constant ci
        key[i] = hash[i]; // key = K0 = current hash, length 64
        W[i]   = data[i]; // copy here - this is work space, length 64
    }
       
    XOR(W,key); // sigma[K0](data) = sigma[K0](ni) in paper

    // do rounds - we need to compose the sigma(K^round) functions
    for (var round = 1; round <= 10; ++round){
        key = NextKey(key,c,round); // next round key and constant computed
        W   = ApplyRho(W,key);      // and applied to work state
    }
    return W;
} // ComputeW

function HashBlock(hash, data){
    var W = new Array(64);
    W = ComputeW(W,hash,data); // compute the W[Hi](ni) = W[hash](data) function and store in W
    XOR(hash,W);
    XOR(hash,data);
} // HashBlock

// hash a block of data, given the size
function Whirlpool(data, size){
    var dataPtr = 0;
    var dataBlock = new Array(64); // one block of data to hash
    var hash      = new Array(64);
    for (var i = 0; i < 64; ++i)
        hash[i] = 0; // zero hash (IV - Initialization Vector)

    // do blocks of data until not enough data left
    var tempSize = size;
    while (tempSize >= 64){
        for (i = 0; i < 64; ++i)
            dataBlock[i] = data[i+dataPtr];
        HashBlock(hash,dataBlock);
        dataPtr  += 64;
        tempSize -= 64;
    }

    // append final bit, and length, as required by the spec
    var temp = new Array(64*2);
    for (var i = 0; i < 64*2; ++i)
        temp[i] = 0; // zero out - may need a lot of space
    
    for (var i = 0; i < tempSize; ++i)
        temp[i] = data[i+dataPtr]; // copy remaining data
    
    temp[tempSize] = 0x80;         // append final bit, next position
    
    var bits = size*8;
    if (tempSize >= 64/2){
        // need 2 blocks - last one didn't leave 256 bits space for appending size
        var tempPtr = 2*64-1; // start at back
        while (bits > 0)
            {
            temp[tempPtr--] = (bits&255);
            bits >>= 8;
            }
        HashBlock(hash,temp);      // hash this block
        for (var i = 0; i < 64; ++i)
            dataBlock[i] = temp[i+64];       
        HashBlock(hash,dataBlock); // and this one
    } else {
        // need 1 block - last one did leave 256 bits space for appending size
        var tempPtr = 64-1; // start at back
        while (bits > 0)
            {
            temp[tempPtr--] = (bits&255);
            bits >>= 8;
            }
        HashBlock(hash,temp); // hash this block
    }
    return hash;
} // Whirlpool

// Convert a string to an array of bytes
function StringToBytes(str){
    var arr = Array(str.length);
    for (var i = 0; i < str.length; ++i)
        arr[i] = str.charCodeAt(i)&255;
    return arr;
}

// convert a string to a hexstring with the whirlpool hash
function HexWhirlpool(str){
    var hash;
    var temp = "";
    str = StringToBytes(str); // todo unicode?
    hash = Whirlpool(str, str.length);
    for (var i = 0; i < 64; ++i)
        temp += Hex(hash[i]);
    
    //olivier : modification au code original
    temp = temp.toLowerCase()
    //fin modif   
    
    return temp;
}

// divide array bigVal.val representing number by integer divisor < 256, and
// return remainder in bigVal.remainder
// modifies bigVal
function DivideRemainder(bigVal, divisor){
    var top = bigVal.val.length-1;
    if (top < 0)        {
        bigVal.remainder = 0;
        return; // nothing to do?!
    }
    
    var answer   = new Array(); // our answer goes here
    var dividend = 0; // current dividend
    var ansPos   = 0; // current answer digit (reversed)
    var digit    = 0; // last digit added
    
    // standard long division
    while (top >= -1)        {
        digit = Math.floor(dividend/divisor); // next digit
        answer[ansPos++] = digit; // save digit
        dividend = dividend-digit*divisor; // remove amount
        if (top >= 0)
            dividend = 256*dividend + bigVal.val[top]; // bring next digit down
        --top;
    }
       
    bigVal.remainder = dividend;   // leftover
    
    // copy back reversed, strip off leading 0's
    bigVal.val = new Array();
    var firstNonzero = 0;
    while ((firstNonzero < answer.length) && (0 == answer[firstNonzero]))
        firstNonzero++;
    var j = 0;
    for (var i = answer.length-1; i >= firstNonzero; --i){
        bigVal.val[j++] = answer[i];
        seenNonzero = true;
    }
} // DivideRemainder

function WhirlpoolTest(){
    return HexWhirlpool("abc") == "4E2448A4C6F486BB16B6562C73B4020BF3043E3A731BCE721AE1B303D97E6D4C7181EEBDB6C57E277D0E34957114CBD6C797FC9D95D8B582D225292076D4EEF5";
}

</script>
