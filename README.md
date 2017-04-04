# Aggregion back-end test case  
  
  
**API**  
  
*POST /user* : регистрация нового пользователя. принимает email, password  
*POST /user/login* : авторизация. возвращает id, email, token  
*GET /user/comments*: возвращает пользователей и количество комментариев в формате [{author: {id, email}, commentsCount: 0}]  
  
*POST /comment*: создает новый комментарий. принимает text, parentComment(айди комментария, на который отвечают, null, если это корневой комментарий)  
*GET /comment*: получает все комментарии  
*GET /comment/:id*: получает конкретный комметарий по айди  
*GET /comment/height*: получает максимальную длину дерева комментариев  
