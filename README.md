<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/logo.jpg">
<h1 align="center">SmartMentor Guru</h1>
<p>
    SmartMentor Guru é um assistente inteligente construido em cima da ferramenta da Google, o <a href="https://dialogflow.cloud.google.com/" target="_blank">Dialogflow</a>, tendo uma conexão com o banco de dados não relacional Firestore, onde é armazenado os usuários, projetos, segmentos, mentores, etc...
</p>
<h2 align="center">Fulfillment</h2>
<p>
    Fulfillment é o código implantado como um webhook que permite que o agente do <a href="https://dialogflow.cloud.google.com/" target="_blank">Dialogflow</a> chame a lógica de negócios de intent a intent. Durante uma conversa, o fulfillment permite usar as informações extraídas pelo processamento de linguagem natural do <a href="https://dialogflow.cloud.google.com/" target="_blank">Dialogflow</a> para gerar respostas dinâmicas ou acionar ações no seu back-end.
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
    <img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/fulfillment.jpg">
    Sempre que adicionar novo código ao Fulfillment, clique no botão <b>"Deploy"</b>, levará alguns segundos. Após o dialogflow carregar o código, ele irá mostrar uma mensagem dizendo que foi realizada o deploy.
</p>
<h3>Inicio Rápido (Edição do Fulfillment)</h3>
<ul>
    <li>Receba acesso e permissões de administrador</li>
    <li>Acesse <a href="https://dialogflow.cloud.google.com/" target="_blank">Dialogflow</a></li>
    <li>Vá para Fulfillment (canto esquerdo)</li>
</ul>
<br />
<h3>Referências e Documentações</h3>
<p>
    Para a elaboração do código do fulfillment, foi utilizado alguns links de documentações e suporte como referências.
    <ul>
        <li>
            <a href="https://cloud.google.com/firestore/docs/how-to">Cloud Firestore basics for managing data</a><br />
            Documentação do Google Cloud para o gerenciamento de dados do Firestore. Nesta documentação possui exemplos de request de informações do banco de dados e exemplos de como adicionar, atualizar e deletar. Vale lembrar que os códigos exemplos devem ser olhados na linguagem Node.js 
        </li>
        <li>
            <a href="https://github.com/dialogflow/dialogflow-fulfillment-nodejs">Dialogflow Fulfillment Library</a><br />
            Repositório da Biblioteca do DialogFlow Fulfillment no GitHub onde possui os arquivos raiz de um exemplo de chatbot pronto. Além de possuir alguns links para outros exemplos que utilizam outras bibliotecas e lógicas para o fulfillment, tais como:
            <ul>
                <li><b>Preenchimento dos paramêtros de uma intent via Fulfillment</b></li>
                <li><b>Criando respostas dinâmicas com Suggestions, Cards, etc</b></li>
                <li><b>Criando respostas dinâmicas com Requests do Firebase's Firestore DB</b></li>
            </ul>
        </li>
        <li>
            <a href="https://dialogflow.com/docs/reference/fulfillment-library/webhook-client">WebhookClient</a><br />
            Documentação da classe responsável pela comunicação do Dialogflow's Webhook na API V2 que possui suporte para <b>Rich Responses</b> (são respostas dinâmicas usando bibliotecas como: Suggestion, Card, Image, Text).
        </li>
        <li>
            <a href="http://www.java2s.com/Tutorials/Javascript/Node.js_Tutorial/index.htm">Node.js Tutorial</a><br />
            Site referência de tutorial com explicações e tutoriais de comandos no Node.js.
        </li>
    </ul>
</p>

<h2 align="center">Firebase</h2>
<p>
    O Firebase é uma plataforma de desenvolvimento de aplicativos para dispositivos móveis e web. Nesta plataforma você tem acesso a várias ferramentas do seu projeto do Google Cloud, neste projeto (GURU) está sendo usado o banco de dados não relacional Firestore e o log das Funções chamadas pelo Fulfillment.
</p>
<h3>Como acessar:</h3>
<h4><strong>1 - </strong> Receba acesso e permissões de administrador</h4>

<h4><strong>2 - </strong> Acesse <a href="https://console.firebase.google.com/?hl=pt-BR" target="_blank">Firebase</a></h4>

<h4>
    <strong>3 - </strong>Você estará em uma página semelhante a imagem abaixo. Caso tenha recebido todas as permissões necessárias, você encontrará um projeto chamado Guru-teste na lista de projetos. Clique nele e será enviado para a home do projeto.
</h4>
<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/firebase/step_1.jpg">
<p><b>OBS:</b> Caso não apareça este projeto na lista de projetos, solicite a liberação das permissões</p>

<h4><strong>4 - </strong> Após clicar em um projeto, você estará na home deste. Aqui você terá acesso a algumas ferramentas. O Guru utiliza as ferramentas: <b>Database e Functions</b></h4>
<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/firebase/step_4.jpg">
<p>
    <ul>
        <li>
            <strong>Database:</strong> Esta aba é onde você terá visão das coleções, documentos, campos, informações do banco de dados.
        </li>
        <li>
            <strong>Functions</strong> Esta aba você terá visão do log(resgistro) do que está acontecendo na comunicação do Dialogflow com o Firebase.
        </li>
    </ul>
</p><br /><br />

<h3>Como fazer uma pesquisa no Firebase's Firestore:</h3>
<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/firebase/pesquisa.jpg">
<br /><br /><br /><br />
<h3>O que ver na aba Functions?!!!</h3>
<img align="center" src="https://github.com/alexlyra/SmartMentor-Guru/blob/master/image/firebase/functions.jpg">