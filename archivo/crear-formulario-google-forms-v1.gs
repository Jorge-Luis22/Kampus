/**
 * Crea el formulario de investigación de Kampus en Google Forms.
 *
 * CÓMO USARLO
 * 1. Entra a script.google.com y crea un proyecto nuevo.
 * 2. Borra todo lo que haya y pega este archivo completo.
 * 3. Dale a Ejecutar (el botón de play). Elige la función crearFormulario.
 * 4. Google te va a pedir autorización: Revisar permisos, tu cuenta,
 *    Configuración avanzada, Ir al proyecto, Permitir.
 * 5. Abre el Registro de ejecución (abajo). Ahí salen los dos enlaces:
 *    el de edición y el que compartes con los alumnos.
 */

function crearFormulario() {

  var form = FormApp.create('Cómo nos conectamos los alumnos de la UTP');

  form.setDescription(
    'Somos un grupo de alumnos de la UTP haciendo una investigación para el curso de ' +
    'Gestión de la Innovación. Queremos entender cómo los estudiantes conseguimos ' +
    'contactos para trabajos académicos, cómo nos enteramos de lo que pasa en la ' +
    'universidad y qué canales usamos para eso.\n\n' +
    'Te va a tomar unos 4 minutos.\n\n' +
    'Es anónima: no pedimos tu nombre, tu código ni tu correo. No hay respuestas ' +
    'correctas ni incorrectas, y lo que respondas solo se usa de forma agregada ' +
    'para esta investigación.\n\n' +
    'Gracias por el tiempo.'
  );

  form.setCollectEmail(false);
  form.setProgressBar(true);
  form.setAllowResponseEdits(false);
  form.setConfirmationMessage(
    'Listo, gracias. Si quieres enterarte de los resultados, ' +
    'escríbele a quien te pasó este formulario.'
  );

  // ---------------------------------------------------------------- SECCIÓN 1
  form.addPageBreakItem()
      .setTitle('Sobre ti')
      .setHelpText('Cuatro preguntas rápidas para poder agrupar las respuestas.');

  form.addListItem()
      .setTitle('¿Qué carrera estudias?')
      .setChoiceValues([
        'Ingeniería de Sistemas e Informática',
        'Ingeniería Industrial',
        'Ingeniería Civil',
        'Ingeniería Mecatrónica',
        'Ingeniería Electrónica',
        'Administración y Negocios Internacionales',
        'Administración de Empresas',
        'Marketing',
        'Contabilidad',
        'Economía',
        'Derecho',
        'Psicología',
        'Ciencias de la Comunicación',
        'Diseño Digital Publicitario',
        'Enfermería',
        'Nutrición',
        'Otra'
      ])
      .setRequired(true);

  form.addListItem()
      .setTitle('¿En qué ciclo estás?')
      .setChoiceValues(['1','2','3','4','5','6','7','8','9','10 o más'])
      .setRequired(true);

  form.addListItem()
      .setTitle('¿En qué sede estudias?')
      .setChoiceValues([
        'Lima Centro',
        'Lima Norte',
        'Lima Sur',
        'Lima Este (Ate)',
        'San Juan de Lurigancho',
        'Otra sede de Lima',
        'Fuera de Lima'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Qué edad tienes?')
      .setChoiceValues(['17 o menos','18 a 20','21 a 23','24 a 26','27 o más'])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 2
  form.addPageBreakItem()
      .setTitle('Tu red en la universidad')
      .setHelpText('Responde con lo que realmente pasa, no con lo que debería pasar.');

  form.addMultipleChoiceItem()
      .setTitle('Sin contar a los de tu salón actual, ¿a cuántos alumnos de la UTP conoces por su nombre?')
      .setChoiceValues(['Ninguno','Entre 1 y 5','Entre 6 y 15','Entre 16 y 30','Más de 30'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('De esos, ¿cuántos son de una carrera distinta a la tuya?')
      .setChoiceValues(['Ninguno','Entre 1 y 3','Entre 4 y 10','Más de 10'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cuándo fue la última vez que conociste a alguien nuevo en la universidad?')
      .setChoiceValues([
        'Esta semana',
        'Este mes',
        'Este ciclo',
        'El ciclo pasado o antes',
        'No recuerdo'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Qué pasa hoy con tus grupos de WhatsApp de ciclos anteriores?')
      .setChoiceValues([
        'Siguen activos y escribo en ellos',
        'Existen pero casi nadie escribe',
        'Los tengo silenciados',
        'Me salí de ellos',
        'No tengo grupos de ciclos anteriores'
      ])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 3
  form.addPageBreakItem()
      .setTitle('Trabajos académicos y encuestas')
      .setHelpText('Sobre los trabajos donde tuviste que recolectar datos de otras personas.');

  form.addMultipleChoiceItem()
      .setTitle('¿En cuántos trabajos académicos has necesitado encuestar o entrevistar gente?')
      .setChoiceValues(['Ninguno','1 o 2','Entre 3 y 5','Más de 5'])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('Cuando necesitaste encuestados, ¿cómo los conseguiste?')
      .setHelpText('Marca todas las que apliquen.')
      .setChoiceValues([
        'Amigos y familia',
        'Mis compañeros de salón',
        'Grupos de WhatsApp',
        'Instagram, Facebook u otra red',
        'Abordé gente en el campus',
        'Un profesor me ayudó',
        'Nunca he necesitado encuestados'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Conseguiste el número de respuestas que necesitabas?')
      .setChoiceValues([
        'Sí, sin problema',
        'Sí, pero me costó mucho',
        'No, entregué con menos de las que pedían',
        'No aplica, nunca he necesitado'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Alguna vez necesitaste encuestar a un perfil específico que no tenías cerca?')
      .setHelpText('Por ejemplo: alumnos de otra carrera, de cierto ciclo o de cierta edad.')
      .setChoiceValues(['Sí','No','No recuerdo'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cuántas encuestas de otros alumnos has respondido este ciclo?')
      .setChoiceValues(['Ninguna','Entre 1 y 3','Entre 4 y 10','Más de 10'])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('¿Qué hace que respondas la encuesta de otro alumno?')
      .setHelpText('Marca todas las que apliquen.')
      .setChoiceValues([
        'Me la pidió un amigo',
        'El tema me interesa',
        'Es corta',
        'Me dan algo a cambio',
        'Por ayudar, sin más',
        'Casi nunca respondo'
      ])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 4
  form.addPageBreakItem()
      .setTitle('Tu correo UTP')
      .setHelpText('Si puedes, abre tu correo institucional antes de responder esta sección.');

  form.addMultipleChoiceItem()
      .setTitle('¿Cuándo abriste tu correo UTP por última vez?')
      .setChoiceValues(['Hoy','Esta semana','Este mes','Hace más de un mes','No recuerdo'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cuántos correos sin leer tienes ahora mismo en tu correo UTP?')
      .setChoiceValues(['Entre 0 y 10','Entre 11 y 50','Entre 51 y 200','Más de 200','No sé'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Qué haces cuando llega un correo de la UTP que no es de un curso?')
      .setChoiceValues([
        'Lo leo completo',
        'Lo veo por encima',
        'Lo ignoro',
        'Ni me entero de que llegó'
      ])
      .setRequired(true);

  form.addTextItem()
      .setTitle('Nombra los programas de empleabilidad, becas o intercambio de la UTP que recuerdes')
      .setHelpText('Escribe los que te vengan a la cabeza. Si no recuerdas ninguno, escribe "ninguno". No vale buscarlos.')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Alguna vez te perdiste algo de la universidad que te hubiera interesado, por enterarte tarde?')
      .setChoiceValues(['Sí','No','No sé'])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 5
  form.addPageBreakItem()
      .setTitle('Eventos y comunidades');

  form.addMultipleChoiceItem()
      .setTitle('¿A cuántos eventos universitarios has ido este año?')
      .setHelpText('Charlas, ferias, talleres, concursos, lo que sea.')
      .setChoiceValues(['Ninguno','1 o 2','Entre 3 y 5','Más de 5'])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Cómo te enteraste del último evento al que fuiste?')
      .setChoiceValues([
        'Correo de la UTP',
        'Un amigo me avisó',
        'Instagram o Facebook',
        'Un afiche o pantalla en el campus',
        'Un profesor lo mencionó en clase',
        'No he ido a ninguno'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Perteneces a algún grupo, club o comunidad de la UTP?')
      .setChoiceValues([
        'Sí, a uno o más',
        'No, pero me gustaría',
        'Lo intenté pero no supe cómo entrar',
        'No, y no me interesa'
      ])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 6
  form.addPageBreakItem()
      .setTitle('Qué usas hoy');

  form.addCheckboxItem()
      .setTitle('Si hoy necesitas contactar a alguien de la UTP que no conoces, ¿qué haces?')
      .setHelpText('Marca todas las que apliquen.')
      .setChoiceValues([
        'Le pido a un amigo que me presente',
        'Lo busco en Instagram',
        'Escribo en un grupo de WhatsApp',
        'Le escribo al correo institucional',
        'Lo busco en Facebook',
        'Nunca lo he hecho'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Has usado Discord?')
      .setChoiceValues([
        'Sí, lo uso seguido',
        'Lo usé antes pero ya no',
        'Sé qué es pero nunca lo he usado',
        'No sé qué es'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('¿Tienes LinkedIn?')
      .setChoiceValues([
        'Sí, y entro seguido',
        'Sí, pero casi nunca entro',
        'No tengo',
        'No sé qué es'
      ])
      .setRequired(true);

  // ---------------------------------------------------------------- SECCIÓN 7
  form.addPageBreakItem()
      .setTitle('Una última cosa');

  form.addParagraphTextItem()
      .setTitle('Si pudieras arreglar una sola cosa de cómo te conectas con otros alumnos de la UTP, ¿cuál sería?')
      .setHelpText('Opcional, pero es la respuesta que más nos sirve.')
      .setRequired(false);

  // ---------------------------------------------------------------- ENLACES
  Logger.log('ENLACE PARA EDITAR: ' + form.getEditUrl());
  Logger.log('ENLACE PARA COMPARTIR: ' + form.getPublishedUrl());
  Logger.log('Listo. Copia el enlace para compartir y mándalo a los alumnos.');
}
