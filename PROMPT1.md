## ARQUITECTURA
Nextjs 16, base de datos MongoDB con driver nativo, y mailhog para envío de mails.

## FUNCIONALIDAD
Hacer una app para autenticación con empleo de magic link soportado con la base de datos MongoDB.
La base de datos MongoDB será creada con el nombre MAGIC-LINK-DB y los atributos del registro serán Id, Mail, y un contador de accesos de cada mail.
La autenticación se hará mediante token jwt guardado en localStorage. 
Cada paso o secuencia de la App será precedido por un título en mayúsculas y a continuación un detalle en minúsculas del proceso.

## FRONT END
Debe ser responsive y tener aspecto profesional con tonos grises y negros con fonts blancos.
Será una interfaz única que contemple:
-Cuadro de texto para ingresar el mail con validación de formato.
-Una ventana no editable donde ver el mail de respuesta de la app y el token asignado.
-Una ventana donde monitorear los cambios en la base de datos MongoDB con scroll. 
-Al enviar el mail para loguearse, se validará el mail ingresado con los registrados en la base de datos MAGIC-LINK-DB.
Si el mail no existe procederá a registrarlo.
Si el mail existe en la base de datos no lo registrará y mostrará un formulario pop up de bienvenida al usuario del mail.
Luego de ingresado el mail, el cuadro de texto del mismo será reseteado, y desencadenará la actualización de las ventanas del mail de respuesta y token, y la de la base de datos MongoDB.

## TESTTING
Para testear el funcionamiento se cargarán 5 mails de los cuales uno estará ya en la base de datos

## DOCUMENTACION DE LA APP
Se creará DOCUMENTACION.md que contendrá:
a. Instrucciones para ejecutar la App.
b. Descripción secuencial de los procesos con descripción detallada de los mismos.
c. Tests realizados
d. Errores durante el desarrollo y sus soluciones
e. Tecnologías, herramientas, y librerías utilizadas por la App.