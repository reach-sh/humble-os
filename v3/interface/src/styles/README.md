# Global Application Styles

A quick primer on the contents of the `src/css` directory.

## What is it?
Global application styles: everything from the app's CSS reset to mixins and a little collection of common, predefined animation classes.

## What does it contain?
* `mixins.scss`:\
Handy global SCSS variables. At time of writing) it only contains a few content/text size helpers, and some text-related mixins like `app-font` (used to define the default application text font) and `heading-font`, used to set a unique text font for **h1 - h6** elements.
* `reset.scss`\
Global Application (S)CSS reset. It uses properties from `mixins.scss` to define default styles for heading (**h1 - h6**) elements.
* `animations.scss`\
Keyframes, mixins, and helper classes for popular CSS UI animations (listed below).

### Animation Classes
Add any of the following classes to an element to trigger the associated animation.\
```css
/* Inline loading indicator: takes the `color` of the target element */
.spinner--after, .spinner--before 

/* Other animations */
.beacon
.bounce
.collapse--horizontal
.collapse--vertical
.expand--horizontal
.expand--vertical
.fade-in
.fade-in-bounce
.fade-out
.pulse
.scale-in
.shake
.spin

/* Qualifier class: run (other) class animation infinitely */
.infinite
```