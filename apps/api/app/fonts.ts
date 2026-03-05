import localFont from 'next/font/local'

export const gluten = localFont({
  src: '../../../packages/ui/assets/fonts/Gluten/Gluten-VariableFont_slnt,wght.ttf',
  variable: '--font-peeps-gluten',
  display: 'swap',
})

export const patrickHand = localFont({
  src: '../../../packages/ui/assets/fonts/Patrick_Hand/PatrickHand-Regular.ttf',
  variable: '--font-peeps-patrick',
  display: 'swap',
})

export const montserrat = localFont({
  src: '../../../packages/ui/assets/fonts/Montserrat/Montserrat-VariableFont_wght.ttf',
  variable: '--font-sans-montserrat',
  display: 'swap',
})

export const merriweather = localFont({
  src: '../../../packages/ui/assets/fonts/Merriweather/Merriweather-VariableFont_opsz,wdth,wght.ttf',
  variable: '--font-sans-merriweather',
  display: 'swap',
})

export const domine = localFont({
  src: '../../../packages/ui/assets/fonts/Domine/Domine-VariableFont_wght.ttf',
  variable: '--font-serif-domine',
  display: 'swap',
})

export const fraunces = localFont({
  src: '../../../packages/ui/assets/fonts/Fraunces/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf',
  variable: '--font-serif-fraunces',
  display: 'swap',
})

export const inconsolata = localFont({
  src: '../../../packages/ui/assets/fonts/Inconsolata/Inconsolata-VariableFont_wdth,wght.ttf',
  variable: '--font-mono-inconsolata',
  display: 'swap',
})

export const dmMono = localFont({
  src: [
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../packages/ui/assets/fonts/DM_Mono/DMMono-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
  ],
  variable: '--font-mono-dm',
  display: 'swap',
})
