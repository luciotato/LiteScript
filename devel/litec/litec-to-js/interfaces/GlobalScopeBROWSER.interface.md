## BROWSER Interface - DOM (partial)
Window, Document, Element, Node, Event, XMLHttpRequest, CSSStyle
    
## global scope 

    global var window, document

    global function alert(message)

### localStorage

    global namespace localStorage
        properties
            length
        
        method getItem(key)
        method setItem(key,value)

## Classes 

### class Window
        properties
            applicationCache
            closed
            content
            document
            frameElement
            frames
            fullScreen
            gamepadconnected
            gamepaddisconnected
            history
            innerHeight
            innerWidth
            length
            location: Location
            locationbar
            menubar
            name
            navigator
            onafterprint
            onbeforeprint
            onbeforeunload
            onblur
            onchange
            onclick
            ondevicelight
            ondevicemotion
            ondeviceorientation
            ondeviceproximity
            ondragdrop
            onfocus
            onhashchange
            onkeydown
            onkeypress
            onkeyup
            onmousedown
            onmousemove
            onmouseout
            onmouseover
            onmouseup
            onpaint
            onpopstate
            onreset
            onresize
            onscroll
            onunload
            opener
            outerHeight
            outerWidth
            parent
            performance
            personalbar
            screen
            screenX
            screenY
            scrollbars
            scrollMaxX
            scrollMaxY
            scrollX
            scrollY
            self
            sidebar
            status
            statusbar
            toolbar
            top
            window
            XPCSafeJSObjectWrapper

        method QueryInterface()
        method back()
        method blur()
        method btoa()
        method captureEvents()
        method clearImmediate()
        method clearTimeout()
        method close()
        method confirm()
        method dispatchEvent()
        method dump()
        method escape()
        method find()
        method focus()
        method forward()
        method getComputedStyle()
        method home()
        method matchMedia()
        method minimize()
        method moveBy()
        method moveTo()
        method onuserproximity()
        method openDialog()
        method print()
        method releaseEvents()
        method resizeBy()
        method resizeTo()
        method restore()
        method scroll()
        method scrollByLines()
        method scrollTo()
        method setCursor()
        method setImmediate()
        method setInterval()
        method setTimeout()
        method showModalDialog()
        method sizeToContent()
        method stop()
        method unescape()
        method updateCommands()
        method cancelAnimationFrame()
        method clearInterval()
        method getAttention()
        method getDefaultComputedStyle()
        method getSelection()
        method importDialog()
        method open()
        method postMessage()
        method prompt()
        method prompter()
        method requestAnimationFrame()
        method routeEvent()
        method scrollBy()
        method scrollByPages()

    class Location
        properties
            ancestorOrigins:array
            hash:string
            host:string
            hostname:string
            href:string
            origin:string
            pathname:string
            port:string
            protocol:string
            search:string
        
        method assign() 
        method reload() 
        method replace() 
        method toString() 
        method valueOf()         


### class Document extends Node
        properties
            location: Location

        method adoptNode() 
        method caretRangeFromPoint() 
        method createAttribute() 
        method createAttributeNS() 
        method createCDATASection() 
        method createComment() 
        method createDocumentFragment() 
        method createElement() 
        method createElementNS() 
        method createEvent() 
        method createExpression() 
        method createNodeIterator() 
        method createNSResolver() 
        method createProcessingInstruction() 
        method createRange() 
        method createTextNode() 
        method createTreeWalker() 
        method elementFromPoint() 
        method evaluate() 
        method execCommand() 
        method getCSSCanvasContext() 
        method getElementById(id) returns Element
        method getElementsByClassName() 
        method getElementsByName() 
        method getElementsByTagName() 
        method getElementsByTagNameNS() 
        method getOverrideStyle() 
        method getSelection() 
        method importNode() 
        method queryCommandEnabled() 
        method queryCommandIndeterm() 
        method queryCommandState() 
        method queryCommandSupported() 
        method queryCommandValue() 
        method registerElement() 
        method webkitCancelFullScreen() 
        method webkitExitFullscreen() 
        method webkitExitPointerLock() 


### class NodeList
        properties
            length


### class Node
        constructor new Node () 
        
        properties
            ownerDocument:Document
            parentNode:Node
            parentElement:object
            nodeName:string
            nodeType:number
            nodeValue
            childNodes: array
            firstChild:Node
            lastChild:Node
            nextSibling:Node
            previousSibling:object
            baseURI:string
            textContent:string
            localName:string
            namespaceURI:string
            prefix:string
            nodePrincipal

        method appendChild() 
        method cloneNode() 
        method compareDocumentPosition() 
        method contains() 
        method hasChildNodes() 
        method insertBefore() 
        method isDefaultNamespace() 
        method isEqualNode() 
        method isSameNode() 
        method isSupported() 
        method lookupNamespaceURI() 
        method lookupPrefix() 
        method normalize() 
        method removeChild() 
        method replaceChild() 
    

### class Element extends Node
        constructor new Element () 
        
        properties

            children:array
            accessKey:string
            align:string
            attributes:array
            childElementCount:number
            classList:array
            className:string
            clientHeight:number
            clientLeft:number
            clientTop:number
            clientWidth:number
            contentEditable:string
            dataset:object
            dir:string
            draggable:boolean
            firstElementChild:object
            hidden:boolean
            id:string
            innerHTML:string
            innerText:string
            isContentEditable:boolean
            lang:string
            lastElementChild:object
            nextElementSibling:object
            offsetHeight:number
            offsetLeft:number
            offsetParent:object
            offsetTop:number
            offsetWidth:number
            onabort:object
            onbeforecopy:object
            onbeforecut:object
            onbeforepaste:object
            onblur:object
            oncancel:object
            oncanplay:object
            oncanplaythrough:object
            onchange:object
            onclick:object
            onclose:object
            oncontextmenu:object
            oncopy:object
            oncuechange:object
            oncut:object
            ondblclick:object
            ondrag:object
            ondragend:object
            ondragenter:object
            ondragleave:object
            ondragover:object
            ondragstart:object
            ondrop:object
            ondurationchange:object
            onemptied:object
            onended:object
            onerror:object
            onfocus:object
            oninput:object
            oninvalid:object
            onkeydown:object
            onkeypress:object
            onkeyup:object
            onload:object
            onloadeddata:object
            onloadedmetadata:object
            onloadstart:object
            onmousedown:object
            onmouseenter:object
            onmouseleave:object
            onmousemove:object
            onmouseout:object
            onmouseover:object
            onmouseup:object
            onmousewheel:object
            onpaste:object
            onpause:object
            onplay:object
            onplaying:object
            onprogress:object
            onratechange:object
            onreset:object
            onscroll:object
            onsearch:object
            onseeked:object
            onseeking:object
            onselect:object
            onselectstart:object
            onshow:object
            onstalled:object
            onsubmit:object
            onsuspend:object
            ontimeupdate:object
            onvolumechange:object
            onwaiting:object
            onwebkitfullscreenchange:object
            onwebkitfullscreenerror:object
            onwheel:object
            outerHTML:string
            outerText:string
            previousElementSibling:object
            scrollHeight:number
            scrollLeft:number
            scrollTop:number
            scrollWidth:number
            spellcheck:boolean
            style:CSSStyle
            tabIndex:number
            tagName:string
            title:string
            translate:boolean
            webkitdropzone:string
            webkitPseudo:string
            webkitShadowRoot:object
        
        method blur() 
        method focus() 
        method getAttribute() 
        method getAttributeNode() 
        method getAttributeNodeNS() 
        method getAttributeNS() 
        method getBoundingClientRect() 
        method getClientRects() 
        method getElementsByClassName() 
        method getElementsByTagName() 
        method getElementsByTagNameNS() 
        method hasAttribute() 
        method hasAttributeNS() 
        method hasAttributes() 
        method insertAdjacentHTML() 
        method querySelector() 
        method querySelectorAll() 
        method remove() 
        method removeAttribute() 
        method removeAttributeNode() 
        method removeAttributeNS() 
        method scrollByLines() 
        method scrollByPages() 
        method scrollIntoView() 
        method scrollIntoViewIfNeeded() 
        method setAttribute() 
        method setAttributeNode() 
        method setAttributeNodeNS() 
        method setAttributeNS() 
        method webkitCreateShadowRoot() 
        method webkitMatchesSelector() 
        method webkitRequestFullScreen() 
        method webkitRequestPointerLock() 
    


### class Event
        constructor new Event () 
        
        properties
            bubbles:boolean
            cancelBubble:boolean
            cancelable:boolean
            currentTarget:Element
            defaultPrevented
            eventPhase
            explicitOriginalTarget
            originalTarget:Element
            target:Element
            timeStamp
            type:string
            isTrusted

        method initEvent() 
        method preventDefault() 
        method stopImmediatePropagation() 
        method stopPropagation() 


### class CSSStyle
        properties
            alignContent:string
            alignItems:string
            alignmentBaseline:string
            alignSelf:string
            background:string
            backgroundAttachment:string
            backgroundClip:string
            backgroundColor:string
            backgroundImage:string
            backgroundOrigin:string
            backgroundPosition:string
            backgroundPositionX:string
            backgroundPositionY:string
            backgroundRepeat:string
            backgroundRepeatX:string
            backgroundRepeatY:string
            backgroundSize:string
            baselineShift:string
            border:string
            borderBottom:string
            borderBottomColor:string
            borderBottomLeftRadius:string
            borderBottomRightRadius:string
            borderBottomStyle:string
            borderBottomWidth:string
            borderCollapse:string
            borderColor:string
            borderImage:string
            borderImageOutset:string
            borderImageRepeat:string
            borderImageSlice:string
            borderImageSource:string
            borderImageWidth:string
            borderLeft:string
            borderLeftColor:string
            borderLeftStyle:string
            borderLeftWidth:string
            borderRadius:string
            borderRight:string
            borderRightColor:string
            borderRightStyle:string
            borderRightWidth:string
            borderSpacing:string
            borderStyle:string
            borderTop:string
            borderTopColor:string
            borderTopLeftRadius:string
            borderTopRightRadius:string
            borderTopStyle:string
            borderTopWidth:string
            borderWidth:string
            bottom:string
            boxShadow:string
            boxSizing:string
            bufferedRendering:string
            captionSide:string
            clear:string
            clip:string
            clipPath:string
            clipRule:string
            color:string
            colorInterpolation:string
            colorInterpolationFilters:string
            colorProfile:string
            colorRendering:string
            content:string
            counterIncrement:string
            counterReset:string
            cssText:string
            cursor:string
            direction:string
            display:string
            dominantBaseline:string
            emptyCells:string
            enableBackground:string
            fill:string
            fillOpacity:string
            fillRule:string
            filter:string
            flex:string
            flexBasis:string
            flexDirection:string
            flexFlow:string
            flexGrow:string
            flexShrink:string
            flexWrap:string
            float:string
            floodColor:string
            floodOpacity:string
            font:string
            fontFamily:string
            fontKerning:string
            fontSize:string
            fontStretch:string
            fontStyle:string
            fontVariant:string
            fontWeight:string
            glyphOrientationHorizontal:string
            glyphOrientationVertical:string
            height:string
            imageRendering:string
            justifyContent:string
            kerning:string
            left:string
            length:number
            letterSpacing:string
            lightingColor:string
            lineHeight:string
            listStyle:string
            listStyleImage:string
            listStylePosition:string
            listStyleType:string
            margin:string
            marginBottom:string
            marginLeft:string
            marginRight:string
            marginTop:string
            marker:string
            markerEnd:string
            markerMid:string
            markerStart:string
            mask:string
            maskType:string
            maxHeight:string
            maxWidth:string
            maxZoom:string
            minHeight:string
            minWidth:string
            minZoom:string
            objectFit:string
            objectPosition:string
            opacity:string
            order:string
            orientation:string
            orphans:string
            outline:string
            outlineColor:string
            outlineOffset:string
            outlineStyle:string
            outlineWidth:string
            overflow:string
            overflowWrap:string
            overflowX:string
            overflowY:string
            padding:string
            paddingBottom:string
            paddingLeft:string
            paddingRight:string
            paddingTop:string
            page:string
            pageBreakAfter:string
            pageBreakBefore:string
            pageBreakInside:string
            parentRule:object
            pointerEvents:string
            position:string
            quotes:string
            resize:string
            right:string
            shapeRendering:string
            size:string
            speak:string
            src:string
            stopColor:string
            stopOpacity:string
            stroke:string
            strokeDasharray:string
            strokeDashoffset:string
            strokeLinecap:string
            strokeLinejoin:string
            strokeMiterlimit:string
            strokeOpacity:string
            strokeWidth:string
            tableLayout:string
            tabSize:string
            textAlign:string
            textAnchor:string
            textDecoration:string
            textIndent:string
            textLineThroughColor:string
            textLineThroughMode:string
            textLineThroughStyle:string
            textLineThroughWidth:string
            textOverflow:string
            textOverlineColor:string
            textOverlineMode:string
            textOverlineStyle:string
            textOverlineWidth:string
            textRendering:string
            textShadow:string
            textTransform:string
            textUnderlineColor:string
            textUnderlineMode:string
            textUnderlineStyle:string
            textUnderlineWidth:string
            top:string
            touchActionDelay:string
            transition:string
            transitionDelay:string
            transitionDuration:string
            transitionProperty:string
            transitionTimingFunction:string
            unicodeBidi:string
            unicodeRange:string
            userZoom:string
            vectorEffect:string
            verticalAlign:string
            visibility:string
            webkitAnimation:string
            webkitAnimationDelay:string
            webkitAnimationDirection:string
            webkitAnimationDuration:string
            webkitAnimationFillMode:string
            webkitAnimationIterationCount:string
            webkitAnimationName:string
            webkitAnimationPlayState:string
            webkitAnimationTimingFunction:string
            webkitAppearance:string
            webkitAppRegion:string
            webkitAspectRatio:string
            webkitBackfaceVisibility:string
            webkitBackgroundClip:string
            webkitBackgroundComposite:string
            webkitBackgroundOrigin:string
            webkitBackgroundSize:string
            webkitBorderAfter:string
            webkitBorderAfterColor:string
            webkitBorderAfterStyle:string
            webkitBorderAfterWidth:string
            webkitBorderBefore:string
            webkitBorderBeforeColor:string
            webkitBorderBeforeStyle:string
            webkitBorderBeforeWidth:string
            webkitBorderEnd:string
            webkitBorderEndColor:string
            webkitBorderEndStyle:string
            webkitBorderEndWidth:string
            webkitBorderFit:string
            webkitBorderHorizontalSpacing:string
            webkitBorderImage:string
            webkitBorderRadius:string
            webkitBorderStart:string
            webkitBorderStartColor:string
            webkitBorderStartStyle:string
            webkitBorderStartWidth:string
            webkitBorderVerticalSpacing:string
            webkitBoxAlign:string
            webkitBoxDecorationBreak:string
            webkitBoxDirection:string
            webkitBoxFlex:string
            webkitBoxFlexGroup:string
            webkitBoxLines:string
            webkitBoxOrdinalGroup:string
            webkitBoxOrient:string
            webkitBoxPack:string
            webkitBoxReflect:string
            webkitBoxShadow:string
            webkitClipPath:string
            webkitColumnAxis:string
            webkitColumnBreakAfter:string
            webkitColumnBreakBefore:string
            webkitColumnBreakInside:string
            webkitColumnCount:string
            webkitColumnGap:string
            webkitColumnProgression:string
            webkitColumnRule:string
            webkitColumnRuleColor:string
            webkitColumnRuleStyle:string
            webkitColumnRuleWidth:string
            webkitColumns:string
            webkitColumnSpan:string
            webkitColumnWidth:string
            webkitFilter:string
            webkitFontFeatureSettings:string
            webkitFontSizeDelta:string
            webkitFontSmoothing:string
            webkitFontVariantLigatures:string
            webkitHighlight:string
            webkitHyphenateCharacter:string
            webkitLineAlign:string
            webkitLineBoxContain:string
            webkitLineBreak:string
            webkitLineClamp:string
            webkitLineGrid:string
            webkitLineSnap:string
            webkitLocale:string
            webkitLogicalHeight:string
            webkitLogicalWidth:string
            webkitMarginAfter:string
            webkitMarginAfterCollapse:string
            webkitMarginBefore:string
            webkitMarginBeforeCollapse:string
            webkitMarginBottomCollapse:string
            webkitMarginCollapse:string
            webkitMarginEnd:string
            webkitMarginStart:string
            webkitMarginTopCollapse:string
            webkitMask:string
            webkitMaskBoxImage:string
            webkitMaskBoxImageOutset:string
            webkitMaskBoxImageRepeat:string
            webkitMaskBoxImageSlice:string
            webkitMaskBoxImageSource:string
            webkitMaskBoxImageWidth:string
            webkitMaskClip:string
            webkitMaskComposite:string
            webkitMaskImage:string
            webkitMaskOrigin:string
            webkitMaskPosition:string
            webkitMaskPositionX:string
            webkitMaskPositionY:string
            webkitMaskRepeat:string
            webkitMaskRepeatX:string
            webkitMaskRepeatY:string
            webkitMaskSize:string
            webkitMaxLogicalHeight:string
            webkitMaxLogicalWidth:string
            webkitMinLogicalHeight:string
            webkitMinLogicalWidth:string
            webkitPaddingAfter:string
            webkitPaddingBefore:string
            webkitPaddingEnd:string
            webkitPaddingStart:string
            webkitPerspective:string
            webkitPerspectiveOrigin:string
            webkitPerspectiveOriginX:string
            webkitPerspectiveOriginY:string
            webkitPrintColorAdjust:string
            webkitRtlOrdering:string
            webkitRubyPosition:string
            webkitTapHighlightColor:string
            webkitTextCombine:string
            webkitTextDecorationsInEffect:string
            webkitTextEmphasis:string
            webkitTextEmphasisColor:string
            webkitTextEmphasisPosition:string
            webkitTextEmphasisStyle:string
            webkitTextFillColor:string
            webkitTextOrientation:string
            webkitTextSecurity:string
            webkitTextStroke:string
            webkitTextStrokeColor:string
            webkitTextStrokeWidth:string
            webkitTransform:string
            webkitTransformOrigin:string
            webkitTransformOriginX:string
            webkitTransformOriginY:string
            webkitTransformOriginZ:string
            webkitTransformStyle:string
            webkitTransition:string
            webkitTransitionDelay:string
            webkitTransitionDuration:string
            webkitTransitionProperty:string
            webkitTransitionTimingFunction:string
            webkitUserDrag:string
            webkitUserModify:string
            webkitUserSelect:string
            webkitWritingMode:string
            whiteSpace:string
            widows:string
            width:string
            wordBreak:string
            wordSpacing:string
            wordWrap:string
            writingMode:string
            zIndex:string
            zoom:string



### global class XMLHttpRequest

XMLHttpRequest is a global javascript Class

        properties

            onload:function
            onerror:function
            ontimeout:function

            readyState:number

            response:object
            responseText:string
            responseType:string
            responseXML:string 

            status:number
            statusText:string

            timeout:number
            upload:object
            withCredentials:boolean

        method abort() 
        method getAllResponseHeaders() 
        method getResponseHeader() 
        method open() 
        method overrideMimeType() 
        method send() 
        method setRequestHeader() 
    

