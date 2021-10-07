<h3>Chiffrement maison pour une communication web client<=>serveur</h3>

Implémentation du chiffre de Vernam pour une communication sécurisée Javascript <=> Php , fonctionne dans les 2 sens pour des transactions sécurisées.

Le processus choisi est celui-ci :

![alt text](https://raw.githubusercontent.com/PoujadeOlivier/Chiffrement_Vernam_Php_Javascript/main/Processus_chiffrement_client_serveur.jpg) 

 Génération de B2 , un secret commun entre le client et le serveur, qui sera utilisé comme grain de sel dans chaque masque jetable.
