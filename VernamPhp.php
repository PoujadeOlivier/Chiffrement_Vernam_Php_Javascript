<?php

//variable à forger à l'authentification, exemple hash(motdepasse + chainealéaoire)
//elle sera créée côté serveur et client, ce sera un secret commun qui sera utilisé comme grain de sel dans chaque masque jetable
$_SESSION['B2']='test';





//https://en.wikipedia.org/wiki/Base64
//attention le caractère = n'est pas présent, il s'agit de padding dans base64, remplissage de blanc...
//global $TAB_binaire;
$TAB_ascii = array('A'=>'000000','B'=>'000001','C'=>'000010','D'=>'000011','E'=>'000100','F'=>'000101','G'=>'000110','H'=>'000111','I'=>'001000','J'=>'001001','K'=>'001010','L'=>'001011','M'=>'001100','N'=>'001101','O'=>'001110','P'=>'001111','Q'=>'010000','R'=>'010001','S'=>'010010','T'=>'010011','U'=>'010100','V'=>'010101','W'=>'010110','X'=>'010111','Y'=>'011000','Z'=>'011001','a'=>'011010','b'=>'011011','c'=>'011100','d'=>'011101','e'=>'011110','f'=>'011111','g'=>'100000','h'=>'100001','i'=>'100010','j'=>'100011','k'=>'100100','l'=>'100101','m'=>'100110','n'=>'100111','o'=>'101000','p'=>'101001','q'=>'101010','r'=>'101011','s'=>'101100','t'=>'101101','u'=>'101110','v'=>'101111','w'=>'110000','x'=>'110001','y'=>'110010','z'=>'110011','0'=>'110100','1'=>'110101','2'=>'110110','3'=>'110111','4'=>'111000','5'=>'111001','6'=>'111010','7'=>'111011','8'=>'111100','9'=>'111101','+'=>'111110','/'=>'111111');

//array_flip : Remplace les clés par les valeurs, et les valeurs par les clés
$TAB_binaire = array_flip($TAB_ascii);

//pour éviter de les envoyées en argument des fonctions, elles seront accessibles n'importe où dans le code
$GLOBALS["TAB_ascii"] = $TAB_ascii;
$GLOBALS["TAB_binaire"] = $TAB_binaire;



function generateurMicrotime()
{
    $TABvirer = array(".", " ");
    //Tu ne peux pas avoir une clé numérique pour le tableau $_SESSION, du coup je rajoute une lettre devant
    $Un = 'f'.substr(str_replace($TABvirer,"",microtime()),1);
        
    return $Un;    
}



function LettreVersAscii($message,$TAB_ascii)
{
    $msgBin = array();
    
    $message = base64_encode($message);
    // fonction Base64 bourre de == à la fin si besoin "padding" mais ne servent à rien et caractère = non dispo dans table binaire base64
    $message = str_replace("=", "", $message);
    //attention calculer la taille du message après l'encode base64 car chaine plus grande
    $NbreCaract = iconv_strlen($message);

    for($i=0; $i<$NbreCaract; $i++)
    {
        $msgBin[$i] = $TAB_ascii[$message[$i]];
        //debug
        //echo $message[$i]." ".$TAB_ascii[$message[$i]]."<br/>";
    }
    
return $msgBin;
}

function AsciiVersLettre($message,$TAB_binaire)
{
    $msgAscii = '';
    
    $NbreCaract = count($message);
    
    for($i=0; $i<$NbreCaract; $i++)
    {
        $msgAscii .= $TAB_binaire[$message[$i]];
    }
    
    $msgAscii = base64_decode($msgAscii);
    
return $msgAscii;
}

function fctBinaireXOR($msgBin,$cleBin)
{
    $msgVERNAM = array();
    
    $NbreCaract = count($msgBin);

    for($i=0; $i<$NbreCaract; $i++)
    {    
        $a = '';
        $b = '';
        $c = '';
        
        $a = $msgBin[$i];
        $b = $cleBin[$i];

        for($j=0; $j<6; $j++)
        {
            if( ($a[$j]=='0') && ($b[$j]=='0') )
            $c .= '0';

            if( ($a[$j]=='1') && ($b[$j]=='1') )
            $c .= '0';
        
            if( ($a[$j]=='1') && ($b[$j]=='0') )
            $c .= '1';
        
            if( ($a[$j]=='0') && ($b[$j]=='1') )
            $c .= '1';        
        }

        $msgVERNAM[$i] = $c;
    }
return $msgVERNAM;
}

//fonction chaine => tableau ou tableau en chaine
function Chainage($entree)
{
    if(is_array($entree))
    {
        $entree = implode('',$entree);
    }
    else
    {
        $entree = str_split($entree,6);
    }

return $entree;
}

function AfficheBinaireDebug($msgBin)
{
    $NbreCaract = count($msgBin);
    for($i=0; $i<$NbreCaract; $i++)
    {
        echo $msgBin[$i]." ";
    }
}


//Olivier : chiffrement Vernam sur un message de 126 caractères pour le moment
function OP1chiffre($msg)
{
    $TAB_ascii = $GLOBALS["TAB_ascii"];

    $Un = generateurMicrotime();
    $B2 = $_SESSION['B2']; //Constante à créer en amont pour complexifier
    $KEYn = hash('whirlpool',$B2.$Un);

    $cleBin = LettreVersAscii($KEYn,$TAB_ascii);
    $msgBin = LettreVersAscii($msg,$TAB_ascii);

    $msgCHIFFRE = fctBinaireXOR($msgBin,$cleBin);

    $msgCHIFFRE = $Un.':'.Chainage($msgCHIFFRE);

return $msgCHIFFRE;
}

function OP1dechiffre($msgCHIFFRE)
{
    $TAB_ascii = $GLOBALS["TAB_ascii"];    
    $TAB_binaire = $GLOBALS["TAB_binaire"];        
    
    $Explode = explode(":",$msgCHIFFRE);
    $msgCHIFFRE = $Explode[1];
    
    $Un = $Explode[0];
    $B2 = $_SESSION['B2'];
    $KEYn = hash('whirlpool',$B2.$Un);

    $msgCHIFFRE = Chainage($msgCHIFFRE);

    $cleBin = LettreVersAscii($KEYn,$TAB_ascii);
    $msgDECHIFFRE = fctBinaireXOR($msgCHIFFRE,$cleBin);
    
    $msgAscii = AsciiVersLettre($msgDECHIFFRE,$TAB_binaire);
    /*
    echo $Un."<br/>";
    echo $B2."<br/>";
    echo $KEYn."<br/>";
    print_r($msgCHIFFRE);
    echo "<br/>";
    print_r($cleBin);
    echo "<br/>";
    print_r($msgDECHIFFRE);
    echo "<br/>";
    echo $msgAscii."<br/>";    
    */
return $msgAscii;
}




//EXEMPLE UTILISATION FONCTIONNEL !!
//OP1

$message = "Test chiffrement de Vernam";
$msgCHIFFRE = OP1chiffre($message);
echo $msgCHIFFRE;
echo"<br/>";
$msgAscii = OP1dechiffre($msgCHIFFRE);
echo $msgAscii;
echo"<br/>";






/*
$message = 'PHP : Test code Vernam';
$cle = 'Hamp¨lk jOId(-yhd_y86z'; //$cle = 'Ha\\\'mp¨lk jOId(-yhd_y86';
$msgBin = LettreVersAscii($message,$TAB_ascii);
$cleBin = LettreVersAscii($cle,$TAB_ascii);




$msgCHIFFRE = fctBinaireXOR($msgBin,$cleBin);
$msgDECHIFFRE = fctBinaireXOR($msgCHIFFRE,$cleBin);



AfficheBinaireDebug($msgBin);
echo'<br/>';
AfficheBinaireDebug($cleBin);
echo'<br/>';
AfficheBinaireDebug($msgCHIFFRE);

echo'<br/>';
echo'<br/>';
echo'<br/>';
AfficheBinaireDebug($msgCHIFFRE);
echo'<br/>';
AfficheBinaireDebug($cleBin);
echo'<br/>';
AfficheBinaireDebug($msgDECHIFFRE);



$msgAscii = AsciiVersLettre($msgDECHIFFRE,$TAB_binaire);
echo $msgAscii;
echo'<br/>';
echo'<br/>';





//LECTURE PAR OCTET
echo $msgBin['2'].'<br/>';
echo $cleBin['2'].'<br/>';
echo $msgCHIFFRE['2'].'<br/><br/>';

echo $msgBin['3'].'<br/>';
echo $cleBin['3'].'<br/>';
echo $msgCHIFFRE['3'].'<br/><br/>';
*/

//FIN EXEMPLE UTILISATION FONCTIONNEL !!





?>
