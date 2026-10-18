# Vault Local

Gestionnaire visuel local pour consulter un export CSV d'identifiants. Interface responsive pensée pour Android et ordinateur.

## Utilisation
1. Ouvre `index.html` dans un navigateur récent, ou publie le dossier sur GitHub Pages.
2. Appuie sur **Importer un fichier** et sélectionne ton CSV.
3. La première ligne doit contenir les colonnes `name`, `url`, `username`, `password`, `note`. Les colonnes peuvent être séparées par virgules, points-virgules ou tabulations.
4. Utilise la recherche, le tri, les boutons Afficher/Masquer et Copier.
5. **Voir la démo** charge uniquement des identifiants fictifs.

## Confidentialité importante
- Le fichier CSV est lu dans le navigateur, sans requête réseau du code de l'application.
- Les identifiants sont conservés uniquement en mémoire pendant la session et sont perdus à l'actualisation/fermeture.
- Ce projet est un visualiseur, pas un coffre-fort chiffré. Ne publie jamais un CSV ou de vrais identifiants dans le dépôt GitHub.
- GitHub Pages héberge publiquement le code du site. N'y mets aucune donnée personnelle.

## GitHub Pages
1. Crée un dépôt GitHub vide.
2. Téléverse `index.html` à la racine du dépôt.
3. Va dans **Settings → Pages**.
4. Dans la source de déploiement, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
5. Ouvre l'URL fournie par GitHub Pages.
 
