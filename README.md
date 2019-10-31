<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/logo.jpg">
<h1 align="center">SmartMentor Guru</h1>
<p>
    SmartMentor Guru é um assistente inteligente construido em cima da ferramenta da Google, o Dialogflow, tendo uma conexão com o banco de dados não relacional Firestore, onde é armazenado os usuários, projetos, segmentos, mentores, etc...
</p>
<h3>Inicio Rápido (Edição do Fulfillment)</h3>
<ul>
    <li>Receba acesso e permissões de administrador</li>
    <li>Acesse <a href="https://dialogflow.cloud.google.com/" target="_blank">Dialogflow</a></li>
    <li>Vá para Fulfillment (canto esquerdo)</li>
</ul>
<br />
<h3>Fulfillment</h3>
<p>
    Fulfillment é o código implantado como um webhook que permite que o agente do Dialogflow chame a lógica de negócios de intent a intent. Durante uma conversa, o fulfillment permite usar as informações extraídas pelo processamento de linguagem natural do Dialogflow para gerar respostas dinâmicas ou acionar ações no seu back-end.
    No Guru, ele é responsável pela tomada de decisão do que fazer com as informações inseridas pelo usuário, além de customizar as perguntas das intents com Suggestions e Cards.<br />
    A linguagem utilizada no Inline Editor é Javascript/Node.js, o dialogflow e o firebase possui algumas bibliotecas próprias necessárias para rodar suas funções.
    <ul>
        <li>
            <b>dialogflow-fulfillment: </b>biblioteca que armazena todas as classes necessárias para fazer request e resonse no fulfillment, e possui outras classes para criar responses dinamicas com integrações a diversas plataformas.
        </li>
        <li>
            <b>firebase-functions: </b>biblioteca que faz chamada de funções armazenadas no Firebase.
        </li>
        <li>
            <b>firebase-admin: </b>biblioteca que permite a conexão com o banco de dados Firestore, permitindo realizar queries que retornam informações do banco e/ou gravam novas informações.
        </li>
    </ul>
    <img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/fulfillment.jpg">
</p>