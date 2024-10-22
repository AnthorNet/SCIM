# Satisfactory-Calculator Interactive Map aka "SCIM"
This repository is here for bug reporting and is not intended to be forked or deployed in any means.


<!-- ABOUT THE PROJECT -->
## About The Project

The interactive map acts as a 2D map rendering engine and a full-featured save editor for Satisfactory.  
A game from [Coffee Stain Studios](https://www.coffeestainstudios.com/)

You can see a [Live Example](https://satisfactory-calculator.com/en/interactive-map?url=https://github.com/AnthorNet/SC-InteractiveMap/raw/dev/CREATIVE%20TEST.sav)

[![SCIM](./img/readmeImage.jpg)](https://satisfactory-calculator.com/en/interactive-map)


<!-- SOCIAL -->
## Social media links

[Discord](https://discord.gg/0sFOD6GxFZRc1ad0)  
[Twitter](https://twitter.com/AnthorNet)  


<!-- LICENSE -->
## License

Reuse of the source code and data assets is not permitted in any case, source code is only available for educational purpose.
The map is solely intended to be used on the [satisfactory-calculator.com](https://satisfactory-calculator.com/) domain.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/AnthorNet/SC-InteractiveMap/issues) for a list of proposed features (and known issues).


<!-- REMOTE LOADING -->
## Remote save loading

You can remotely load a dedicated server save by appending **?url=SAVE_LINK** to the interactive map URL.  
The server needs to send the save file with a valid SSL certificate and CORS enabled.  

```nginx
server {
    server_name             satisfactory.domain; # Dedicated server domain
    root                    /home/steam/.config/Epic/FactoryGame/Saved/SaveGames/server; # SAVE FOLDER

    listen                  443 ssl; # managed by Certbot
    ssl_certificate         /etc/letsencrypt/live/satisfactory.domain/fullchain.pem; # managed by Certbot
    ssl_certificate_key     /etc/letsencrypt/live/satisfactory.domain/privkey.pem; # managed by Certbot    
    include                 /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam             /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    # Make the save loadable by the map
    add_header              Access-Control-Allow-Headers "Access-Control-Allow-Origin";
    add_header              Access-Control-Allow-Origin "https://satisfactory-calculator.com";
    if_modified_since       before; # Will trigger auto refresh!

    if ($request_method = OPTIONS) { return 200; }
 }
```