<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/logo.jpg">
<h1 align="center">SmartMentor Guru</h1>
<p>
    SmartMentor Guru é um assistente inteligente construido em cima da ferramenta da Google, o Dialogflow, tendo uma conexão com o banco de dados não relacional Firestore, onde é armazenado os usuários, projetos, segmentos, mentores, etc...
</p>
<h3>Inicio Rápido (Edição do Fulfillment)</h3>
<ul>
    <li>Receba acesso e permissões de administrador</li>
    <li>Acesse <a href="https://dialogflow.cloud.google.com/">Dialogflow</a></li>
    <li>Vá para Fulfillment (canto esquerdo)</li>
</ul>
<br />
<h3>Fulfillment</h3>
<p>
    Fulfillment é o código implantado como um webhook que permite que o agente do Dialogflow chame a lógica de negócios de intent a intent. Durante uma conversa, o fulfillment permite usar as informações extraídas pelo processamento de linguagem natural do Dialogflow para gerar respostas dinâmicas ou acionar ações no seu back-end.
    No Guru, ele é responsável pela tomada de decisão do que fazer com as informações inseridas pelo usuário, além de customizar as perguntas das intents com Suggestions e Cards.
</p>