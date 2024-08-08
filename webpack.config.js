const path = require('path');

module.exports = {
  // Pour améliorer l'expérience développeur (facilite le débogage, améliore les messages d'erreur)
  mode: 'development',
  // Pour définir le point d'entrée de l'app que Webpack va aller chercher
  entry: './src/app.ts',
  // Pour définir le serveur de développement et indiquer à webpack où se trouvent nos assets en local
  devServer: {
    static: [{ directory: path.join(__dirname)}]
  },
  // Pour définir le point de sortie -> là où webpack doit placé le fichier de production généré
  output: {
    // Seul fichier JS qui sera produit à la fin -> OU app.js
    filename: 'bundle.js', 
    // Chemin absolu vers la racine du projet !!!
    // Doit être identique à l'option "outDir" du tsconfig.json
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
  },
  // Pour dire à webpack que des sourcemaps sont déjà prévue dans tsconfig.json et qu'il devra les reconnecter correctement après la génération du fichier de production pour qu'elles restent utilisables
  devtool: 'inline-source-map',
  // Pour dire à webpack quoi faire avec les fichiers .ts
  module: {
    rules: [
      {
        // Test que webpack effectuera sur chaque fichier pour savoir si la règle s'applique
        test: /\.ts$/, // -> a une extension .ts
        // Ce que webpack doit faire avec ce type de fichiers :
        // -> utiliser ts-loader pour les charger 
        // -> ce qui prendra en compte les options du tsconfig.json
        use: 'ts-loader',
        // Ne pas traiter ces dossiers/fichiers
        exclude: /node-modules/
      }
    ]
  },
  // Pour dire à webpack quelles extensions de fichiers il doit ajouter aux importations
  resolve: {
    extensions: ['.ts', '.js'] // Webpack va rechercher ces fichiers et les regrouper
  }
};