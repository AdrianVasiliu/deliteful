define(function(){ return '\
.d-scrollable {\
  -webkit-overflow-scrolling: touch;\
  overflow-y: scroll;\
  overflow-x: hidden;\
  -ms-touch-action: none;\
  /* trigger hardware accelaration */\
  -webkit-transform: translate3d(0, 0, 0);\
}\
'; } );