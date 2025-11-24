import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.tsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=657b04ee"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=657b04ee"; const React = __vite__cjsImport3_react.__esModule ? __vite__cjsImport3_react.default : __vite__cjsImport3_react; const useState = __vite__cjsImport3_react["useState"];
import "/src/App.css";
function HeaderComponent() {
  return /* @__PURE__ */ jsxDEV("header", { className: "main-header", "data-component": "header", children: [
    /* @__PURE__ */ jsxDEV("h1", { className: "title", "data-element": "main-title", children: "Vite Design Mode Plugin Demo" }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: "navigation", "data-component": "nav", children: /* @__PURE__ */ jsxDEV("ul", { className: "nav-list", children: [
      /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "#features", className: "nav-link", children: "Features" }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 33,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 32,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "#examples", className: "nav-link", children: "Examples" }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 37,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "#docs", className: "nav-link", children: "Documentation" }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 43,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 42,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 31,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, this);
}
_c = HeaderComponent;
class CounterComponent extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      count: this.props.initial || 0
    };
  }
  render() {
    return /* @__PURE__ */ jsxDEV("div", { className: "counter-container", "data-component": "counter", children: [
      /* @__PURE__ */ jsxDEV("h2", { "data-element": "counter-title", children: "计数器示例" }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 62,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "counter-display", children: /* @__PURE__ */ jsxDEV("span", { className: "counter-value", "data-element": "counter-value", children: [
        "当前值: ",
        this.state.count
      ] }, void 0, true, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 64,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 63,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "counter-buttons", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: "counter-btn increment",
            onClick: () => this.setState({ count: this.state.count + 1 }),
            "data-action": "increment",
            children: "+1"
          },
          void 0,
          false,
          {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 69,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: "counter-btn decrement",
            onClick: () => this.setState({ count: this.state.count - 1 }),
            "data-action": "decrement",
            children: "-1"
          },
          void 0,
          false,
          {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 76,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: "counter-btn reset",
            onClick: () => this.setState({ count: 0 }),
            "data-action": "reset",
            children: "重置"
          },
          void 0,
          false,
          {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 83,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 68,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this);
  }
}
function FeatureSection() {
  const features = [
    {
      id: "source-mapping",
      title: "源码映射",
      description: "自动注入源码位置信息到DOM元素",
      icon: "🗺️"
    },
    {
      id: "ast-analysis",
      title: "AST分析",
      description: "基于Babel AST的精确组件识别",
      icon: "🔍"
    },
    {
      id: "hot-reload",
      title: "热更新",
      description: "与Vite开发服务器无缝集成",
      icon: "⚡"
    }
  ];
  return /* @__PURE__ */ jsxDEV("section", { className: "features-section", "data-section": "features", children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "section-title", "data-element": "section-title", children: "插件特性" }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 121,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "features-grid", children: features.map(
      (feature) => /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "feature-card",
          "data-feature": feature.id,
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "feature-icon", "data-element": "feature-icon", children: feature.icon }, void 0, false, {
              fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
              lineNumber: 131,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("h3", { className: "feature-title", "data-element": "feature-title", children: feature.title }, void 0, false, {
              fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
              lineNumber: 134,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              "p",
              {
                className: "feature-description",
                "data-element": "feature-description",
                children: feature.description
              },
              void 0,
              false,
              {
                fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
                lineNumber: 137,
                columnNumber: 13
              },
              this
            )
          ]
        },
        feature.id,
        true,
        {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 126,
          columnNumber: 9
        },
        this
      )
    ) }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 124,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
    lineNumber: 120,
    columnNumber: 5
  }, this);
}
_c2 = FeatureSection;
function DynamicContent() {
  _s();
  const [isVisible, setIsVisible] = useState(false);
  const [items, setItems] = useState(["项目1", "项目2", "项目3"]);
  return /* @__PURE__ */ jsxDEV("div", { className: "dynamic-section", "data-section": "dynamic", children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "section-title", "data-element": "dynamic-title", children: "动态内容示例" }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 157,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "dynamic-controls", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: "toggle-btn",
          onClick: () => setIsVisible(!isVisible),
          "data-action": "toggle-visibility",
          children: [
            isVisible ? "隐藏" : "显示",
            "内容"
          ]
        },
        void 0,
        true,
        {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 162,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: "add-item-btn",
          onClick: () => setItems([...items, `项目${items.length + 1}`]),
          "data-action": "add-item",
          children: "添加项目"
        },
        void 0,
        false,
        {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 169,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 161,
      columnNumber: 7
    }, this),
    isVisible && /* @__PURE__ */ jsxDEV("div", { className: "dynamic-content", "data-element": "dynamic-list", children: /* @__PURE__ */ jsxDEV("ul", { className: "items-list", children: items.map(
      (item, index) => /* @__PURE__ */ jsxDEV("li", { className: "list-item", "data-item": index, children: [
        /* @__PURE__ */ jsxDEV("span", { className: "item-text", children: item }, void 0, false, {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 183,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            className: "remove-btn",
            onClick: () => setItems(items.filter((_, i) => i !== index)),
            "data-action": "remove-item",
            children: "×"
          },
          void 0,
          false,
          {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 184,
            columnNumber: 17
          },
          this
        )
      ] }, index, true, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 182,
        columnNumber: 11
      }, this)
    ) }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 180,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 179,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
    lineNumber: 156,
    columnNumber: 5
  }, this);
}
_s(DynamicContent, "ve3r1vIaFZxAaXG7Nau8RfGM2ms=");
_c3 = DynamicContent;
function ContactForm() {
  _s2();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`表单提交成功!
姓名: ${formData.name}
邮箱: ${formData.email}`);
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return /* @__PURE__ */ jsxDEV("section", { className: "form-section", "data-section": "contact", children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "section-title", "data-element": "form-title", children: "联系表单" }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 224,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "form",
      {
        className: "contact-form",
        onSubmit: handleSubmit,
        "data-form": "contact",
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxDEV("label", { htmlFor: "name", className: "form-label", children: "姓名" }, void 0, false, {
              fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
              lineNumber: 233,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleChange,
                className: "form-input",
                "data-element": "name-input",
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
                lineNumber: 236,
                columnNumber: 11
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 232,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxDEV("label", { htmlFor: "email", className: "form-label", children: "邮箱" }, void 0, false, {
              fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
              lineNumber: 249,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleChange,
                className: "form-input",
                "data-element": "email-input",
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
                lineNumber: 252,
                columnNumber: 11
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 248,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxDEV("label", { htmlFor: "message", className: "form-label", children: "消息" }, void 0, false, {
              fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
              lineNumber: 265,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV(
              "textarea",
              {
                id: "message",
                name: "message",
                value: formData.message,
                onChange: handleChange,
                className: "form-textarea",
                "data-element": "message-textarea",
                rows: 4,
                required: true
              },
              void 0,
              false,
              {
                fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
                lineNumber: 268,
                columnNumber: 11
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 264,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("button", { type: "submit", className: "submit-btn", "data-action": "submit-form", children: "发送消息" }, void 0, false, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 280,
            columnNumber: 9
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 227,
        columnNumber: 7
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
    lineNumber: 223,
    columnNumber: 5
  }, this);
}
_s2(ContactForm, "cRGivdu4kk0x+g1ddJGmIV4n560=");
_c4 = ContactForm;
function App() {
  return /* @__PURE__ */ jsxDEV("div", { className: "App", "data-appdev-component": "App", children: [
    /* @__PURE__ */ jsxDEV(HeaderComponent, {}, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 292,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { className: "main-content", children: [
      /* @__PURE__ */ jsxDEV("section", { className: "hero-section", "data-section": "hero", children: /* @__PURE__ */ jsxDEV("div", { className: "hero-content", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "hero-title", "data-element": "hero-title", children: "Vite Plugin AppDev Design Mode" }, void 0, false, {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 297,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "hero-description", "data-element": "hero-description", children: "一个强大的Vite插件，为React开发者提供源码映射和可视化编辑功能" }, void 0, false, {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 300,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "hero-buttons", children: [
          /* @__PURE__ */ jsxDEV("button", { className: "hero-btn primary", "data-action": "get-started", children: "开始使用" }, void 0, false, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 304,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "hero-btn secondary", "data-action": "view-docs", children: "查看文档" }, void 0, false, {
            fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
            lineNumber: 307,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
          lineNumber: 303,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 296,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 295,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(CounterComponent, { initial: 5 }, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 314,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(FeatureSection, {}, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 315,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(DynamicContent, {}, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 316,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(ContactForm, {}, void 0, false, {
        fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
        lineNumber: 317,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 294,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "main-footer", "data-component": "footer", children: /* @__PURE__ */ jsxDEV("p", { className: "footer-text", "data-element": "footer-text", children: "© 2024 Vite Plugin AppDev Design Mode. All rights reserved." }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 321,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
      lineNumber: 320,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx",
    lineNumber: 291,
    columnNumber: 5
  }, this);
}
_c5 = App;
export default App;
var _c, _c2, _c3, _c4, _c5;
$RefreshReg$(_c, "HeaderComponent");
$RefreshReg$(_c2, "FeatureSection");
$RefreshReg$(_c3, "DynamicContent");
$RefreshReg$(_c4, "ContactForm");
$RefreshReg$(_c5, "App");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/Users/a1234/www/vite-plugin-appdev-design-mode/examples/react-tsx/src/App.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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LGFBQUFILEtBQUE7QUFBQUcsYUFBQUQsS0FBQSIsIm5hbWVzIjpbIlJlYWN0IiwidXNlU3RhdGUiLCJIZWFkZXJDb21wb25lbnQiLCJfYyIsIkNvdW50ZXJDb21wb25lbnQiLCJDb21wb25lbnQiLCJzdGF0ZSIsImNvdW50IiwicHJvcHMiLCJpbml0aWFsIiwicmVuZGVyIiwic2V0U3RhdGUiLCJGZWF0dXJlU2VjdGlvbiIsImZlYXR1cmVzIiwiaWQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiaWNvbiIsIm1hcCIsImZlYXR1cmUiLCJfYzIiLCJEeW5hbWljQ29udGVudCIsIl9zIiwiaXNWaXNpYmxlIiwic2V0SXNWaXNpYmxlIiwiaXRlbXMiLCJzZXRJdGVtcyIsImxlbmd0aCIsIml0ZW0iLCJpbmRleCIsImZpbHRlciIsIl8iLCJpIiwiX2MzIiwiQ29udGFjdEZvcm0iLCJfczIiLCJmb3JtRGF0YSIsInNldEZvcm1EYXRhIiwibmFtZSIsImVtYWlsIiwibWVzc2FnZSIsImhhbmRsZVN1Ym1pdCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImFsZXJ0IiwiaGFuZGxlQ2hhbmdlIiwidGFyZ2V0IiwidmFsdWUiLCJfYzQiLCJBcHAiLCJfYzUiLCIkUmVmcmVzaFJlZyQiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQXBwLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgJy4vQXBwLmNzcyc7XG5cbi8vIOWHveaVsOe7hOS7tuekuuS+i1xuZnVuY3Rpb24gSGVhZGVyQ29tcG9uZW50KCkge1xuICByZXR1cm4gKFxuICAgIDxoZWFkZXIgY2xhc3NOYW1lPSdtYWluLWhlYWRlcicgZGF0YS1jb21wb25lbnQ9J2hlYWRlcic+XG4gICAgICA8aDEgY2xhc3NOYW1lPSd0aXRsZScgZGF0YS1lbGVtZW50PSdtYWluLXRpdGxlJz5cbiAgICAgICAgVml0ZSBEZXNpZ24gTW9kZSBQbHVnaW4gRGVtb1xuICAgICAgPC9oMT5cbiAgICAgIDxuYXYgY2xhc3NOYW1lPSduYXZpZ2F0aW9uJyBkYXRhLWNvbXBvbmVudD0nbmF2Jz5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT0nbmF2LWxpc3QnPlxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxhIGhyZWY9JyNmZWF0dXJlcycgY2xhc3NOYW1lPSduYXYtbGluayc+XG4gICAgICAgICAgICAgIEZlYXR1cmVzXG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgICA8bGk+XG4gICAgICAgICAgICA8YSBocmVmPScjZXhhbXBsZXMnIGNsYXNzTmFtZT0nbmF2LWxpbmsnPlxuICAgICAgICAgICAgICBFeGFtcGxlc1xuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgPGxpPlxuICAgICAgICAgICAgPGEgaHJlZj0nI2RvY3MnIGNsYXNzTmFtZT0nbmF2LWxpbmsnPlxuICAgICAgICAgICAgICBEb2N1bWVudGF0aW9uXG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvbmF2PlxuICAgIDwvaGVhZGVyPlxuICApO1xufVxuXG4vLyDnsbvnu4Tku7bnpLrkvotcbmNsYXNzIENvdW50ZXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8eyBpbml0aWFsPzogbnVtYmVyIH0+IHtcbiAgc3RhdGUgPSB7XG4gICAgY291bnQ6IHRoaXMucHJvcHMuaW5pdGlhbCB8fCAwLFxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J2NvdW50ZXItY29udGFpbmVyJyBkYXRhLWNvbXBvbmVudD0nY291bnRlcic+XG4gICAgICAgIDxoMiBkYXRhLWVsZW1lbnQ9J2NvdW50ZXItdGl0bGUnPuiuoeaVsOWZqOekuuS+izwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdjb3VudGVyLWRpc3BsYXknPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nY291bnRlci12YWx1ZScgZGF0YS1lbGVtZW50PSdjb3VudGVyLXZhbHVlJz5cbiAgICAgICAgICAgIOW9k+WJjeWAvDoge3RoaXMuc3RhdGUuY291bnR9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2NvdW50ZXItYnV0dG9ucyc+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPSdjb3VudGVyLWJ0biBpbmNyZW1lbnQnXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgY291bnQ6IHRoaXMuc3RhdGUuY291bnQgKyAxIH0pfVxuICAgICAgICAgICAgZGF0YS1hY3Rpb249J2luY3JlbWVudCdcbiAgICAgICAgICA+XG4gICAgICAgICAgICArMVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nY291bnRlci1idG4gZGVjcmVtZW50J1xuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IGNvdW50OiB0aGlzLnN0YXRlLmNvdW50IC0gMSB9KX1cbiAgICAgICAgICAgIGRhdGEtYWN0aW9uPSdkZWNyZW1lbnQnXG4gICAgICAgICAgPlxuICAgICAgICAgICAgLTFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9J2NvdW50ZXItYnRuIHJlc2V0J1xuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IGNvdW50OiAwIH0pfVxuICAgICAgICAgICAgZGF0YS1hY3Rpb249J3Jlc2V0J1xuICAgICAgICAgID5cbiAgICAgICAgICAgIOmHjee9rlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuLy8g5aSN5p2C5bWM5aWX57uE5Lu256S65L6LXG5mdW5jdGlvbiBGZWF0dXJlU2VjdGlvbigpIHtcbiAgY29uc3QgZmVhdHVyZXMgPSBbXG4gICAge1xuICAgICAgaWQ6ICdzb3VyY2UtbWFwcGluZycsXG4gICAgICB0aXRsZTogJ+a6kOeggeaYoOWwhCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ+iHquWKqOazqOWFpea6kOeggeS9jee9ruS/oeaBr+WIsERPTeWFg+e0oCcsXG4gICAgICBpY29uOiAn8J+Xuu+4jycsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2FzdC1hbmFseXNpcycsXG4gICAgICB0aXRsZTogJ0FTVOWIhuaekCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ+WfuuS6jkJhYmVsIEFTVOeahOeyvuehrue7hOS7tuivhuWIqycsXG4gICAgICBpY29uOiAn8J+UjScsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2hvdC1yZWxvYWQnLFxuICAgICAgdGl0bGU6ICfng63mm7TmlrAnLFxuICAgICAgZGVzY3JpcHRpb246ICfkuI5WaXRl5byA5Y+R5pyN5Yqh5Zmo5peg57yd6ZuG5oiQJyxcbiAgICAgIGljb246ICfimqEnLFxuICAgIH0sXG4gIF07XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9J2ZlYXR1cmVzLXNlY3Rpb24nIGRhdGEtc2VjdGlvbj0nZmVhdHVyZXMnPlxuICAgICAgPGgyIGNsYXNzTmFtZT0nc2VjdGlvbi10aXRsZScgZGF0YS1lbGVtZW50PSdzZWN0aW9uLXRpdGxlJz5cbiAgICAgICAg5o+S5Lu254m55oCnXG4gICAgICA8L2gyPlxuICAgICAgPGRpdiBjbGFzc05hbWU9J2ZlYXR1cmVzLWdyaWQnPlxuICAgICAgICB7ZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGtleT17ZmVhdHVyZS5pZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nZmVhdHVyZS1jYXJkJ1xuICAgICAgICAgICAgZGF0YS1mZWF0dXJlPXtmZWF0dXJlLmlkfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmZWF0dXJlLWljb24nIGRhdGEtZWxlbWVudD0nZmVhdHVyZS1pY29uJz5cbiAgICAgICAgICAgICAge2ZlYXR1cmUuaWNvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT0nZmVhdHVyZS10aXRsZScgZGF0YS1lbGVtZW50PSdmZWF0dXJlLXRpdGxlJz5cbiAgICAgICAgICAgICAge2ZlYXR1cmUudGl0bGV9XG4gICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgPHBcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPSdmZWF0dXJlLWRlc2NyaXB0aW9uJ1xuICAgICAgICAgICAgICBkYXRhLWVsZW1lbnQ9J2ZlYXR1cmUtZGVzY3JpcHRpb24nXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtmZWF0dXJlLmRlc2NyaXB0aW9ufVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn1cblxuLy8g5Yqo5oCB5YaF5a6556S65L6LXG5mdW5jdGlvbiBEeW5hbWljQ29udGVudCgpIHtcbiAgY29uc3QgW2lzVmlzaWJsZSwgc2V0SXNWaXNpYmxlXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2l0ZW1zLCBzZXRJdGVtc10gPSB1c2VTdGF0ZShbJ+mhueebrjEnLCAn6aG555uuMicsICfpobnnm64zJ10pO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J2R5bmFtaWMtc2VjdGlvbicgZGF0YS1zZWN0aW9uPSdkeW5hbWljJz5cbiAgICAgIDxoMiBjbGFzc05hbWU9J3NlY3Rpb24tdGl0bGUnIGRhdGEtZWxlbWVudD0nZHluYW1pYy10aXRsZSc+XG4gICAgICAgIOWKqOaAgeWGheWuueekuuS+i1xuICAgICAgPC9oMj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9J2R5bmFtaWMtY29udHJvbHMnPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPSd0b2dnbGUtYnRuJ1xuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzVmlzaWJsZSghaXNWaXNpYmxlKX1cbiAgICAgICAgICBkYXRhLWFjdGlvbj0ndG9nZ2xlLXZpc2liaWxpdHknXG4gICAgICAgID5cbiAgICAgICAgICB7aXNWaXNpYmxlID8gJ+makOiXjycgOiAn5pi+56S6J33lhoXlrrlcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9J2FkZC1pdGVtLWJ0bidcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRJdGVtcyhbLi4uaXRlbXMsIGDpobnnm64ke2l0ZW1zLmxlbmd0aCArIDF9YF0pfVxuICAgICAgICAgIGRhdGEtYWN0aW9uPSdhZGQtaXRlbSdcbiAgICAgICAgPlxuICAgICAgICAgIOa3u+WKoOmhueebrlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7aXNWaXNpYmxlICYmIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2R5bmFtaWMtY29udGVudCcgZGF0YS1lbGVtZW50PSdkeW5hbWljLWxpc3QnPlxuICAgICAgICAgIDx1bCBjbGFzc05hbWU9J2l0ZW1zLWxpc3QnPlxuICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPGxpIGtleT17aW5kZXh9IGNsYXNzTmFtZT0nbGlzdC1pdGVtJyBkYXRhLWl0ZW09e2luZGV4fT5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J2l0ZW0tdGV4dCc+e2l0ZW19PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT0ncmVtb3ZlLWJ0bidcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEl0ZW1zKGl0ZW1zLmZpbHRlcigoXywgaSkgPT4gaSAhPT0gaW5kZXgpKX1cbiAgICAgICAgICAgICAgICAgIGRhdGEtYWN0aW9uPSdyZW1vdmUtaXRlbSdcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICDDl1xuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuXG4vLyDooajljZXnu4Tku7bnpLrkvotcbmZ1bmN0aW9uIENvbnRhY3RGb3JtKCkge1xuICBjb25zdCBbZm9ybURhdGEsIHNldEZvcm1EYXRhXSA9IHVzZVN0YXRlKHtcbiAgICBuYW1lOiAnJyxcbiAgICBlbWFpbDogJycsXG4gICAgbWVzc2FnZTogJycsXG4gIH0pO1xuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgYWxlcnQoYOihqOWNleaPkOS6pOaIkOWKnyFcXG7lp5PlkI06ICR7Zm9ybURhdGEubmFtZX1cXG7pgq7nrrE6ICR7Zm9ybURhdGEuZW1haWx9YCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQ2hhbmdlID0gKFxuICAgIGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQgfCBIVE1MVGV4dEFyZWFFbGVtZW50PlxuICApID0+IHtcbiAgICBzZXRGb3JtRGF0YSh7XG4gICAgICAuLi5mb3JtRGF0YSxcbiAgICAgIFtlLnRhcmdldC5uYW1lXTogZS50YXJnZXQudmFsdWUsXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9J2Zvcm0tc2VjdGlvbicgZGF0YS1zZWN0aW9uPSdjb250YWN0Jz5cbiAgICAgIDxoMiBjbGFzc05hbWU9J3NlY3Rpb24tdGl0bGUnIGRhdGEtZWxlbWVudD0nZm9ybS10aXRsZSc+XG4gICAgICAgIOiBlOezu+ihqOWNlVxuICAgICAgPC9oMj5cbiAgICAgIDxmb3JtXG4gICAgICAgIGNsYXNzTmFtZT0nY29udGFjdC1mb3JtJ1xuICAgICAgICBvblN1Ym1pdD17aGFuZGxlU3VibWl0fVxuICAgICAgICBkYXRhLWZvcm09J2NvbnRhY3QnXG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdmb3JtLWdyb3VwJz5cbiAgICAgICAgICA8bGFiZWwgaHRtbEZvcj0nbmFtZScgY2xhc3NOYW1lPSdmb3JtLWxhYmVsJz5cbiAgICAgICAgICAgIOWnk+WQjVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPSd0ZXh0J1xuICAgICAgICAgICAgaWQ9J25hbWUnXG4gICAgICAgICAgICBuYW1lPSduYW1lJ1xuICAgICAgICAgICAgdmFsdWU9e2Zvcm1EYXRhLm5hbWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgICAgICAgICAgY2xhc3NOYW1lPSdmb3JtLWlucHV0J1xuICAgICAgICAgICAgZGF0YS1lbGVtZW50PSduYW1lLWlucHV0J1xuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZm9ybS1ncm91cCc+XG4gICAgICAgICAgPGxhYmVsIGh0bWxGb3I9J2VtYWlsJyBjbGFzc05hbWU9J2Zvcm0tbGFiZWwnPlxuICAgICAgICAgICAg6YKu566xXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9J2VtYWlsJ1xuICAgICAgICAgICAgaWQ9J2VtYWlsJ1xuICAgICAgICAgICAgbmFtZT0nZW1haWwnXG4gICAgICAgICAgICB2YWx1ZT17Zm9ybURhdGEuZW1haWx9XG4gICAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlQ2hhbmdlfVxuICAgICAgICAgICAgY2xhc3NOYW1lPSdmb3JtLWlucHV0J1xuICAgICAgICAgICAgZGF0YS1lbGVtZW50PSdlbWFpbC1pbnB1dCdcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9J2Zvcm0tZ3JvdXAnPlxuICAgICAgICAgIDxsYWJlbCBodG1sRm9yPSdtZXNzYWdlJyBjbGFzc05hbWU9J2Zvcm0tbGFiZWwnPlxuICAgICAgICAgICAg5raI5oGvXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGlkPSdtZXNzYWdlJ1xuICAgICAgICAgICAgbmFtZT0nbWVzc2FnZSdcbiAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5tZXNzYWdlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUNoYW5nZX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nZm9ybS10ZXh0YXJlYSdcbiAgICAgICAgICAgIGRhdGEtZWxlbWVudD0nbWVzc2FnZS10ZXh0YXJlYSdcbiAgICAgICAgICAgIHJvd3M9ezR9XG4gICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxidXR0b24gdHlwZT0nc3VibWl0JyBjbGFzc05hbWU9J3N1Ym1pdC1idG4nIGRhdGEtYWN0aW9uPSdzdWJtaXQtZm9ybSc+XG4gICAgICAgICAg5Y+R6YCB5raI5oGvXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn1cblxuLy8g5Li75bqU55So57uE5Lu2XG5mdW5jdGlvbiBBcHAoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9J0FwcCcgZGF0YS1hcHBkZXYtY29tcG9uZW50PSdBcHAnPlxuICAgICAgPEhlYWRlckNvbXBvbmVudCAvPlxuXG4gICAgICA8bWFpbiBjbGFzc05hbWU9J21haW4tY29udGVudCc+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT0naGVyby1zZWN0aW9uJyBkYXRhLXNlY3Rpb249J2hlcm8nPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdoZXJvLWNvbnRlbnQnPlxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT0naGVyby10aXRsZScgZGF0YS1lbGVtZW50PSdoZXJvLXRpdGxlJz5cbiAgICAgICAgICAgICAgVml0ZSBQbHVnaW4gQXBwRGV2IERlc2lnbiBNb2RlXG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPSdoZXJvLWRlc2NyaXB0aW9uJyBkYXRhLWVsZW1lbnQ9J2hlcm8tZGVzY3JpcHRpb24nPlxuICAgICAgICAgICAgICDkuIDkuKrlvLrlpKfnmoRWaXRl5o+S5Lu277yM5Li6UmVhY3TlvIDlj5HogIXmj5DkvpvmupDnoIHmmKDlsITlkozlj6/op4bljJbnvJbovpHlip/og71cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdoZXJvLWJ1dHRvbnMnPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0naGVyby1idG4gcHJpbWFyeScgZGF0YS1hY3Rpb249J2dldC1zdGFydGVkJz5cbiAgICAgICAgICAgICAgICDlvIDlp4vkvb/nlKhcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPSdoZXJvLWJ0biBzZWNvbmRhcnknIGRhdGEtYWN0aW9uPSd2aWV3LWRvY3MnPlxuICAgICAgICAgICAgICAgIOafpeeci+aWh+aho1xuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPENvdW50ZXJDb21wb25lbnQgaW5pdGlhbD17NX0gLz5cbiAgICAgICAgPEZlYXR1cmVTZWN0aW9uIC8+XG4gICAgICAgIDxEeW5hbWljQ29udGVudCAvPlxuICAgICAgICA8Q29udGFjdEZvcm0gLz5cbiAgICAgIDwvbWFpbj5cblxuICAgICAgPGZvb3RlciBjbGFzc05hbWU9J21haW4tZm9vdGVyJyBkYXRhLWNvbXBvbmVudD0nZm9vdGVyJz5cbiAgICAgICAgPHAgY2xhc3NOYW1lPSdmb290ZXItdGV4dCcgZGF0YS1lbGVtZW50PSdmb290ZXItdGV4dCc+XG4gICAgICAgICAgwqkgMjAyNCBWaXRlIFBsdWdpbiBBcHBEZXYgRGVzaWduIE1vZGUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAgICAgIDwvcD5cbiAgICAgIDwvZm9vdGVyPlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iXSwiZmlsZSI6Ii9Vc2Vycy9hMTIzNC93d3cvdml0ZS1wbHVnaW4tYXBwZGV2LWRlc2lnbi1tb2RlL2V4YW1wbGVzL3JlYWN0LXRzeC9zcmMvQXBwLnRzeCJ9