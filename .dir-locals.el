(
  (auto-mode-alist . (("\\.html\\'" . web-mode)))
  (web-mode . (
                (eval . (web-mode-set-engine "django"))
                (web-mode-enable-front-matter-block t)
               )
            )
 )
