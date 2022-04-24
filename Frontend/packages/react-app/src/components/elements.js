import styled from "styled-components";

export const InteractionContainer = styled.div`
    border-radius:10px;
    padding:10px;
    display:flex;
    flex-wrap:wrap;
    border:solid;
    color:dodgerblue;
    width:fit-content;
`;

export const Input = styled.input`
    padding:0px;
    font-size:1em;
    font-weight:bold;
    text-align:right;
    border:none;
    outline:none;
    color:dodgerblue;
    width:100%;

    &:focus{
        background-color:rgb(250,250,255);
    }
    `

export const Button = styled.button`
    border-radius:5px;
    padding:15px;
    background-color:dodgerblue;
    border:none;
    margin-top:10px;
    color:white;
    font-size:medium;
    cursor:pointer;
    outline:2px #fff solid;
    outline-offset:-2px;
    &:hover{
        background-color:white;
        color:dodgerblue;
        outline:2px dodgerblue solid;

    }
`

