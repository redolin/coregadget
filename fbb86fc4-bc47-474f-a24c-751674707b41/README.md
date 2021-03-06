gadget-通用型社團
==========================

* 身份「老師」
* 運用語法來撰寫 javascript
* 運用 less css 語法來撰寫 css
* 運用 gadget 物件呼叫 dsa 服務，依據呼叫不同類型的服務，來操做"瀏覽、評分"等功能
* 運用 twitter bootstrap 做為畫面設計的板型


----------


功能說明
-------

**社團紀錄**

 - 班導師看自己班上學生社團情形(有帶班才出現)
 - 可點選按鈕切換「學年度學期」，最新的「學年度學期」排第一個(由近至遠)
 - 如果學生於該「學年度學期」未參加資料(休學)，將不顯示

>復學學生情境：
>97、98上學，99休學，100復學。
>
>則「學年度學期」為該班級所有學生社團資料的「**最大值**」，會出現97,98,99,100
>

**成績登錄**

 - 於開放登錄期間，提供社團老師填寫成績(為社團的 **評分老師** 才出現)
 - 可使用下拉選單切換社團
 - 試算成績線上試算，但不儲存，亦不能編輯，成績四捨五入
 - 學期成績只顯示，不能編輯
 - 可使用上下鍵、Enter鍵操作成績輸入框
 - 學生名單改採班級、座號排序


**幹部登錄**

 - 提供社團老師登錄社團幹部(為社團的 **評分老師** 才出現)
 - 可使用下拉選單切換社團
 - 學生名單改採班級、座號排序

----------


檔案說明
-------
**一般共用**

js/bootstrap.js

      // 將這3行註解：使編輯的對話框，點擊背景時不會關閉
      // if (this.options.backdrop != 'static') {
      //   this.$backdrop.click($.proxy(this.hide, this))
      // }

**小工具專用**

js/club.js：用於處理瀏覽

**驗證用 ([jQuery plugin: Validation][1] 版本1.9.0)**

js/jquery.metadata.js：驗證規則使用 class={} 時需引用的檔

js/jquery.validate.min.js：驗證用主程式

js/messages_tw.js：提示訊息中文化


  [1]: http://bassistance.de/jquery-plugins/jquery-plugin-validation/

